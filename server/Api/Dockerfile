FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# copy csproj and restore
COPY *.csproj ./
RUN dotnet restore

# copy everything and publish
COPY . ./
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish ./
# Expose a default port
EXPOSE 5000
# At runtime, read PORT env var (Render sets $PORT) and set ASPNETCORE_URLS accordingly.
ENV ASPNETCORE_URLS="http://+:${PORT:-5000}"
ENTRYPOINT ["dotnet", "Api.dll"]
