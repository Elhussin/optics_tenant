def set_token_cookies(response, access: str = None, refresh: str = None):
    if access:
        response.set_cookie(
            key="access_token",
            value=access,
            httponly=True,
            secure=True,  # اجعلها False في بيئة التطوير إذا لزم الأمر
            samesite='Lax',
            path="/",
            max_age=60 * 15  # 15 دقيقة
        )
    
    if refresh:
        response.set_cookie(
            key="refresh_token",
            value=refresh,
            httponly=True,
            secure=True,
            samesite='Lax',
            path="/",
            max_age=60 * 60 * 24 * 7  # 7 أيام
        )
