from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class _Identifiants(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email")
    @classmethod
    def email_en_minuscules(cls, v: str) -> str:
        return v.strip().lower()


class RegisterIn(_Identifiants):
    # 72 octets : au-delà, bcrypt tronque silencieusement le mot de passe.
    password: str = Field(min_length=8, max_length=72)


class LoginIn(_Identifiants):
    password: str = Field(min_length=1, max_length=72)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"