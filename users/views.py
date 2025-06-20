from django.shortcuts import render
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view
from django.contrib.auth import authenticate
from rest_framework import viewsets
from .serializers import UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

# Create your views here.
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

# @api_view(['POST'])
# def login_view(request):
#     email = request.data.get('email')
#     password = request.data.get('password')
#     user = authenticate(request, email=email, password=password)

#     if not user:
#         return Response({"detail": "Invalid credentials"}, status=401)

#     refresh = RefreshToken.for_user(user)
#     access_token = str(refresh.access_token)

#     response = Response({"detail": "Login successful"})

#     response.set_cookie(
#         key='access_token',
#         value=access_token,
#         httponly=True,
#         samesite='Lax',
#         secure=True,  # اجعله True في الإنتاج
#         max_age=300
#     )

#     response.set_cookie(
#         key='refresh_token',
#         value=str(refresh),
#         httponly=True,
#         samesite='Lax',
#         secure=True,
#         max_age=7 * 24 * 3600
#     )

#     return response


@api_view(['POST'])
def login_view(request):
    refresh = RefreshToken.for_user(request.user)
    access = str(refresh.access_token)
    response = Response({"detail": "Login successful"})
    response.set_cookie(
        "access_token", access,
        httponly=True, secure=True, samesite="Lax",
        domain=".example.com", max_age=300
    )
    response.set_cookie(
        "refresh_token", str(refresh),
        httponly=True, secure=True, samesite="Lax",
        domain=".example.com", max_age=7*24*3600
    )
    return response

# domain=".example.com" يضمن مشاركة الكوكيز عبر جميع subdomains (tenants)

# HttpOnly, Secure, SameSite=Lax لتعزيز الأمان

# @api_view(['POST'])
# def refresh_token_view(request):
#     from rest_framework_simplejwt.tokens import RefreshToken

#     refresh_token = request.COOKIES.get('refresh_token')
#     if not refresh_token:
#         return Response({"detail": "No refresh token"}, status=401)

#     try:
#         refresh = RefreshToken(refresh_token)
#         access = refresh.access_token

#         response = Response({"detail": "Token refreshed"})
#         response.set_cookie(
#             key='access_token',
#             value=str(access),
#             httponly=True,
#             samesite='Lax',
#             secure=True,
#             max_age=300
#         )
#         return response
#     except Exception as e:
#         return Response({"detail": "Invalid token"}, status=401)

@api_view(['POST'])
def refresh_token_view(request):
    token = request.COOKIES.get('refresh_token')
    refresh = RefreshToken(token)
    new_access = str(refresh.access_token)
    res = Response({"detail": "Refreshed"})
    res.set_cookie("access_token", new_access, httponly=True, secure=True, samesite="Lax", domain=".example.com", max_age=300)
    return res

@api_view(['POST'])
def logout_view(request):
    response = Response({"detail": "Logged out"})
    response.delete_cookie('access_token', domain=".example.com")
    response.delete_cookie('refresh_token', domain=".example.com")
    return response


# @api_view(['POST'])
# def logout_view(request):
#     response = Response({"detail": "Logged out"})
#     response.delete_cookie('access_token')
#     response.delete_cookie('refresh_token')
#     return response

@api_view(['POST'])
def register_view(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({"detail": "User registered successfully"})

    return Response(serializer.errors, status=400)

@api_view(['POST'])
def update_profile_view(request):
    user = request.user
    serializer = UserSerializer(user, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"detail": "Profile updated successfully"})

    return Response(serializer.errors, status=400)


# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def profile(request):
#     return Response({"user": request.user.email})
