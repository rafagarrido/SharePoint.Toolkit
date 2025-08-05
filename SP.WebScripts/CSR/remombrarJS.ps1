# Conectar al sitio
Connect-PnPOnline -Url "https://tusitio.sharepoint.com/sites/tuSitio" -UseWebLogin

# Variables
$listaNombre = "NombreLista"               # Cambia por tu lista
$vistaNombre = "reuniones globales"       # Nombre de la vista
$bibliotecaEstilos = "Style Library"      # Biblioteca donde están los js
$carpetaJs = "TuCarpeta"                   # Carpeta dentro de la biblioteca, si hay
$baseJsName = "CalendarioGlobal.V"        # Prefijo del archivo JS

# Obtener lista y vista
$lista = Get-PnPList -Identity $listaNombre
$vista = Get-PnPView -List $lista -Identity $vistaNombre

# Obtener archivos js existentes que coincidan con el patrón
$jsFiles = Get-PnPFolderItem -FolderSiteRelativeUrl "$bibliotecaEstilos/$carpetaJs" -ItemType File | 
    Where-Object { $_.Name -match "^$baseJsName(\d+)\.js$" }

if ($jsFiles.Count -eq 0) {
    Write-Host "No se encontró ningún archivo JS que coincida con el patrón. Debes subir el archivo base primero." -ForegroundColor Red
    return
}

# Extraer los números y obtener el máximo
$versiones = $jsFiles | ForEach-Object {
    [int]($_.Name -replace "^$baseJsName(\d+)\.js$",'$1')
}

$maxVersion = ($versiones | Measure-Object -Maximum).Maximum
$nuevaVersion = $maxVersion + 1

# Nombres de archivos
$archivoActual = "$baseJsName$maxVersion.js"
$nuevoArchivo = "$baseJsName$nuevaVersion.js"

# Copiar el archivo actual a uno nuevo (clonando con la nueva versión)
Copy-PnPFile -SourceUrl "$bibliotecaEstilos/$carpetaJs/$archivoActual" -TargetUrl "$bibliotecaEstilos/$carpetaJs/$nuevoArchivo" -OverwriteIfAlreadyExists

# Actualizar JSLink de la vista para usar el nuevo archivo
$vista.JSLink = "~sitecollection/$bibliotecaEstilos/$carpetaJs/$nuevoArchivo"
$vista.Update()
Invoke-PnPQuery

Write-Host "JSLink actualizado a $nuevoArchivo en la vista '$vistaNombre'"
