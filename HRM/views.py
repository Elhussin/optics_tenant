from django.shortcuts import render

# Create your views here.
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view
from django.contrib.auth import authenticate

@api_view(['POST'])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    user = authenticate(request, email=email, password=password)

    if not user:
        return Response({"detail": "Invalid credentials"}, status=401)

    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)

    response = Response({"detail": "Login successful"})

    response.set_cookie(
        key='access_token',
        value=access_token,
        httponly=True,
        samesite='Lax',
        secure=True,  # اجعله True في الإنتاج
        max_age=300
    )

    response.set_cookie(
        key='refresh_token',
        value=str(refresh),
        httponly=True,
        samesite='Lax',
        secure=True,
        max_age=7 * 24 * 3600
    )

    return response



@api_view(['POST'])
def refresh_token_view(request):
    from rest_framework_simplejwt.tokens import RefreshToken

    refresh_token = request.COOKIES.get('refresh_token')
    if not refresh_token:
        return Response({"detail": "No refresh token"}, status=401)

    try:
        refresh = RefreshToken(refresh_token)
        access = refresh.access_token

        response = Response({"detail": "Token refreshed"})
        response.set_cookie(
            key='access_token',
            value=str(access),
            httponly=True,
            samesite='Lax',
            secure=True,
            max_age=300
        )
        return response
    except Exception as e:
        return Response({"detail": "Invalid token"}, status=401)

@api_view(['POST'])
def logout_view(request):
    response = Response({"detail": "Logged out"})
    response.delete_cookie('access_token')
    response.delete_cookie('refresh_token')
    return response
