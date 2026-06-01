# Football Forum Web API

**Факултетен номер:** 2401321013

**Студент:** Васил Божков

Кратко описание:
Това е уеб API проект (форум за футбол), реализиран с ASP.NET Core и Entity Framework Core. Проектът поддържа регистрация и автентикация на потребители, създаване и преглед на публикации, коментари, харесвания и управление на отбори.

Инсталация и стартиране (Windows):

1. Инсталирайте .NET 8 SDK: https://dotnet.microsoft.com/download
2. Конфигурирайте connection string в appsettings.json (полето ConnectionStrings:DefaultConnection).
3. Настройте JWT секрета в appsettings.json (полето Jwt:Key).
4. (Опционално) Приложете миграциите и създайте базата данни:
   ```powershell
   dotnet tool install --global dotnet-ef --version 8.*
   dotnet ef database update
   ```
5. Стартирайте приложението:
   ```powershell
   dotnet run
   ```

Swagger документацията ще бъде достъпна на /swagger когато приложението работи.

--

## Project Overview

This is a .NET 8 Web API project with the following structure:

- Entities - Database entity models
- Controllers - API controllers
- Services - Business logic services
- Data - Database context and repositories
- JWT - JWT token generation and utilities
- DTOs - Data Transfer Objects

## Getting Started

1. Install .NET 8 SDK
2. Configure the connection string in appsettings.json
3. Update the JWT secret key for production
4. Run the application:
   ```
   dotnet run
   ```

## Configuration

- JWT settings are in appsettings.json
- Database connection string should be configured before running migrations
- Swagger documentation is available at /swagger

## Technologies

- .NET 8
- ASP.NET Core Web API
- Entity Framework Core
- JWT Authentication
- Swagger/OpenAPI
