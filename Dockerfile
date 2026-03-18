# --- Stage 1: Build .NET services ---
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS dotnet-build
WORKDIR /src
COPY src/ .

# Build Organisation API
RUN dotnet publish OrgReg.Organisation.Api/OrgReg.Organisation.Api.csproj -c Release -o /app/organisation-api /p:UseAppHost=false

# Build Fake Dynamics
RUN dotnet publish OrgReg.FakeDynamics/OrgReg.FakeDynamics.csproj -c Release -o /app/fake-dynamics /p:UseAppHost=false

# --- Stage 2: Build Frontend ---
FROM node:22-alpine AS frontend-build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci || npm install
COPY frontend/ .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=
RUN npm run build

# --- Stage 3: Final runtime ---
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

# Install Node.js, nginx, and supervisor
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    nginx \
    supervisor \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy .NET apps
COPY --from=dotnet-build /app/organisation-api /app/organisation-api
COPY --from=dotnet-build /app/fake-dynamics /app/fake-dynamics

# Copy Next.js standalone app
COPY --from=frontend-build /app/.next/standalone /app/frontend
COPY --from=frontend-build /app/.next/static /app/frontend/.next/static
COPY --from=frontend-build /app/public /app/frontend/public

# Copy nginx and supervisor config
COPY nginx.conf /etc/nginx/sites-enabled/default
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Remove default nginx config that conflicts
RUN rm -f /etc/nginx/sites-enabled/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
