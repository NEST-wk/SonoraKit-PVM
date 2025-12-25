"""
Servicio de cifrado usando Fernet (AES-128).
"""
from cryptography.fernet import Fernet, InvalidToken
from typing import Optional
from app.core.config import settings
from app.core.logger import logger


class EncryptionService:
    """Servicio de cifrado simétrico usando Fernet."""

    def __init__(self, master_key: Optional[str] = None):
        """
        Args:
            master_key: Clave opcional. Si no se pasa, usa settings.master_key
        """
        self._master_key = master_key
        self._cipher: Optional[Fernet] = None
        self._initialized = False

    def _ensure_initialized(self):
        """Inicializa el cipher solo cuando se necesita."""
        if self._initialized:
            return

        try:
            key = self._master_key or settings.master_key
            if not key:
                raise ValueError("No master key provided")
            self._cipher = Fernet(key.encode())
            self._initialized = True
        except Exception as e:
            logger.error(f"Failed to initialize encryption: {e}")
            raise ValueError(
                "Invalid MASTER_KEY. Generate with: "
                "python -c 'from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())'"
            ) from e

    @property
    def cipher(self) -> Fernet:
        """Retorna el cipher inicializado."""
        self._ensure_initialized()
        if self._cipher is None:
            raise RuntimeError("Cipher not initialized")
        return self._cipher

    def encrypt(self, plaintext: str) -> str:
        """Cifra texto plano."""
        if not plaintext:
            raise ValueError("Cannot encrypt empty string")
        return self.cipher.encrypt(plaintext.encode()).decode()

    def decrypt(self, encrypted_text: str) -> str:
        """Descifra texto."""
        if not encrypted_text:
            raise ValueError("Cannot decrypt empty string")
        try:
            return self.cipher.decrypt(encrypted_text.encode()).decode()
        except InvalidToken:
            raise ValueError("Invalid encrypted token")

    def rotate_key(self, encrypted_text: str, old_key: str) -> str:
        """Re-cifra con clave actual después de descifrar con clave antigua."""
        old_cipher = Fernet(old_key.encode())
        plaintext = old_cipher.decrypt(encrypted_text.encode()).decode()
        return self.encrypt(plaintext)

    def validate(self, encrypted_text: str) -> bool:
        """Valida si el texto puede descifrarse."""
        try:
            self.decrypt(encrypted_text)
            return True
        except (ValueError, InvalidToken):
            return False


def generate_master_key() -> str:
    """Genera una MASTER_KEY válida para Fernet."""
    return Fernet.generate_key().decode()


# Instancia global (lazy)
encryption_service = EncryptionService()
