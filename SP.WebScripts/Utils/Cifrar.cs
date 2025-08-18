using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;

public static class Aes256GcmCrypto
{
    // Ajustes recomendados
    private const int KeySizeBytes = 32;        // 256 bits
    private const int SaltSizeBytes = 16;       // 128 bits
    private const int NonceSizeBytes = 12;      // 96 bits (GCM estándar)
    private const int TagSizeBytes = 16;        // 128 bits (GCM tag)
    private const int Pbkdf2Iterations = 200_000;

    /// <summary>
    /// Cifra un texto con AES-256-GCM. Devuelve Base64 de (salt | nonce | ciphertext | tag).
    /// </summary>
    public static string EncryptToBase64(string plaintext, string password)
    {
        if (plaintext == null) throw new ArgumentNullException(nameof(plaintext));
        if (password == null) throw new ArgumentNullException(nameof(password));

        byte[] salt = RandomBytes(SaltSizeBytes);
        byte[] key = DeriveKey(password, salt, KeySizeBytes);

        byte[] nonce = RandomBytes(NonceSizeBytes);
        byte[] plainBytes = Encoding.UTF8.GetBytes(plaintext);

        byte[] cipher = new byte[plainBytes.Length];
        byte[] tag = new byte[TagSizeBytes];

        using (var aes = new AesGcm(key))
        {
            aes.Encrypt(nonce, plainBytes, cipher, tag);
        }

        // Empaquetar: salt | nonce | ciphertext | tag
        byte[] packed = new byte[salt.Length + nonce.Length + cipher.Length + tag.Length];
        Buffer.BlockCopy(salt, 0, packed, 0, salt.Length);
        Buffer.BlockCopy(nonce, 0, packed, salt.Length, nonce.Length);
        Buffer.BlockCopy(cipher, 0, packed, salt.Length + nonce.Length, cipher.Length);
        Buffer.BlockCopy(tag, 0, packed, salt.Length + nonce.Length + cipher.Length, tag.Length);

        return Convert.ToBase64String(packed);
    }

    /// <summary>
    /// Descifra un Base64 producido por EncryptToBase64.
    /// </summary>
    public static string DecryptFromBase64(string base64, string password)
    {
        if (base64 == null) throw new ArgumentNullException(nameof(base64));
        if (password == null) throw new ArgumentNullException(nameof(password));

        byte[] packed = Convert.FromBase64String(base64);

        // Extraer: salt | nonce | ciphertext | tag
        int offset = 0;
        byte[] salt = new byte[SaltSizeBytes];
        Buffer.BlockCopy(packed, offset, salt, 0, salt.Length); offset += salt.Length;

        byte[] nonce = new byte[NonceSizeBytes];
        Buffer.BlockCopy(packed, offset, nonce, 0, nonce.Length); offset += nonce.Length;

        // Lo restante se divide en ciphertext y tag
        int remaining = packed.Length - offset;
        if (remaining < TagSizeBytes) throw new CryptographicException("Formato inválido.");
        int cipherLen = remaining - TagSizeBytes;

        byte[] cipher = new byte[cipherLen];
        byte[] tag = new byte[TagSizeBytes];
        Buffer.BlockCopy(packed, offset, cipher, 0, cipher.Length); offset += cipher.Length;
        Buffer.BlockCopy(packed, offset, tag, 0, tag.Length);

        byte[] key = DeriveKey(password, salt, KeySizeBytes);
        byte[] plain = new byte[cipher.Length];

        using (var aes = new AesGcm(key))
        {
            // Lanza excepción si la autenticación falla (password incorrecta o datos corruptos)
            aes.Decrypt(nonce, cipher, tag, plain);
        }

        return Encoding.UTF8.GetString(plain);
    }

    private static byte[] DeriveKey(string password, byte[] salt, int sizeBytes)
    {
        using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, Pbkdf2Iterations, HashAlgorithmName.SHA256);
        return pbkdf2.GetBytes(sizeBytes);
    }

    private static byte[] RandomBytes(int len)
    {
        byte[] b = new byte[len];
        RandomNumberGenerator.Fill(b);
        return b;
    }
}

// Ejemplo de uso:
public class Program
{
    public static void Main()
    {
        string texto = "Mensaje súper secreto 🤫";
        string password = "MiContraseñaFuerte!";

        string cipherB64 = Aes256GcmCrypto.EncryptToBase64(texto, password);
        Console.WriteLine("Cifrado (Base64): " + cipherB64);

        string descifrado = Aes256GcmCrypto.DecryptFromBase64(cipherB64, password);
        Console.WriteLine("Descifrado: " + descifrado);
    }
}