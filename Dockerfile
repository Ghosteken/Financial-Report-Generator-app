### Multi-stage Dockerfile to build frontend config and API, then run API serving frontend from wwwroot

FROM node:18-alpine AS frontend-config
WORKDIR /src
COPY package.json package-lock.json* ./
COPY build-config.js ./
ENV CI=true
ARG API_BASE=""
ENV API_BASE=${API_BASE}
RUN npm install --no-audit --no-fund || true
RUN node build-config.js

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
# copy API project files
COPY server/Api/*.csproj ./
RUN dotnet restore

# copy rest of repo
COPY . ./

# copy generated config and static files into server/Api/wwwroot
RUN mkdir -p server/Api/wwwroot
RUN cp -v config.js server/Api/wwwroot/ || true
RUN cp -rv index.html styles.css app.js server/Api/wwwroot/ || true

RUN dotnet publish server/Api -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish ./
EXPOSE 5000
ENV ASPNETCORE_URLS="http://+:${PORT:-5000}"
ENTRYPOINT ["dotnet", "Api.dll"]
