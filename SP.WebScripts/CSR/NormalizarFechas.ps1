# Requisitos: PnP.PowerShell instalado y configurado
# Connect-PnPOnline -Url "https://tu-servidor/sites/tuSitio" -Credentials (Get-Credential)

Function Normalize-Date {
    param([object]$raw)

    if ($null -eq $raw) { return $null }

    # Si ya es DateTime
    if ($raw -is [datetime]) {
        $dt = [datetime]$raw
        return $dt.ToUniversalTime()
    }

    $s = $raw.ToString().Trim()

    if ([string]::IsNullOrWhiteSpace($s)) { return $null }

    # Caso MS JSON /Date(1234567890)/
    if ($s -match '^/Date\((\d+)([+-]\d+)?\)/$') {
        $ms = [long]$matches[1]
        $epoch = [datetime]'1970-01-01T00:00:00Z'
        return $epoch.AddMilliseconds($ms)
    }

    # Intentar formatos comunes (día/mes/año, ISO, etc.)
    $formats = @(
        "yyyy-MM-ddTHH:mm:ssZ",
        "yyyy-MM-ddTHH:mm:ss",
        "yyyy-MM-dd",
        "dd/MM/yyyy",
        "d/M/yyyy",
        "dd-MM-yyyy",
        "d-M-yyyy",
        "MM/dd/yyyy",
        "M/d/yyyy"
    )

    foreach ($fmt in $formats) {
        try {
            $dt = [datetime]::ParseExact($s, $fmt, [System.Globalization.CultureInfo]::InvariantCulture)
            return $dt.ToUniversalTime()
        } catch {
            # ignorar
        }
    }

    # Intentar parse flexible (cultura española)
    try {
        $dt = [datetime]::Parse($s, [System.Globalization.CultureInfo]::GetCultureInfo("es-ES"))
        return $dt.ToUniversalTime()
    } catch {
        # último intento con invariant
        try {
            $dt = [datetime]::Parse($s, [System.Globalization.CultureInfo]::InvariantCulture)
            return $dt.ToUniversalTime()
        } catch {
            Write-Warning "No se pudo normalizar fecha: '$s'"
            return $null
        }
    }
}

# --- Configuración ---
$siteUrl = "http://tuserver/sites/tuSitio"
$listaOrigen = "CalendarioSubsitoA"
$listaDestino = "CalendarioGlobal"

Connect-PnPOnline -Url $siteUrl -Credentials (Get-Credential)

# Obtener items de origen (ajusta campos que necesitas)
$items = Get-PnPListItem -List $listaOrigen -PageSize 500 -Fields "ID","Title","StartDate","EndDate","Location"

foreach ($it in $items) {
    $rawStart = $it.FieldValues["StartDate"]
    $rawEnd   = $it.FieldValues["EndDate"]

    $startUtc = Normalize-Date $rawStart
    $endUtc   = Normalize-Date $rawEnd

    if ($null -eq $startUtc) {
        Write-Warning "Item ID $($it.Id) SKIP: StartDate inválida ('$rawStart')"
        continue
    }

    # Preparar valores para crear o actualizar en destino
    $values = @{
        "Title" = $it.FieldValues["Title"]
        "EventDate" = $startUtc     # PnP acepta DateTime object
    }
    if ($null -ne $endUtc) { $values["EndDate"] = $endUtc }

    # Si quieres crear un nuevo item:
    Add-PnPListItem -List $listaDestino -Values $values

    # Si quieres actualizar (por ejemplo, buscar por un campo de sincronización), usa Set-PnPListItem
    # Set-PnPListItem -List $listaDestino -Identity $destId -Values $values

    Write-Host "Insertado: $($it.FieldValues['Title']) - start: $($startUtc.ToString('s') + 'Z')"
}

Disconnect-PnPOnline