# Plex Bot To Discord

``` node index.js & ```

# Opis kodu
Powyższy skrypt wykonuje następujące funkcje:

- Tworzy bazę danych SQLite i tabelę dla filmów.
- Skanuje serwer Plex w celu pobrania filmów i dodaje je do bazy danych.
- Wysyła powiadomienia do Discord o nowych filmach.
- Obsługuje komendy użytkowników w Discord.
- Obsługa błędów
- Każda funkcja zawiera odpowiednie mechanizmy obsługi błędów, aby zapewnić stabilność działania aplikacji. W przypadku wystąpienia błędu, odpowiednia informacja jest logowana w konsoli.

# Wymagania
Aby uruchomić skrypt, należy zainstalować odpowiednie biblioteki:

```properties
npm install discord.js sqlite3 axios progress
```
Lub wykonca tą komendę

```properties
npm install
```

# Konfiguracja
Plik config.json powinien zawierać następujące dane:

```bash
{
    "bot_token": "YOUR_BOT_TOKEN",
    "plex_token": "YOUR_PLEX_TOKEN",
    "discord_Ccannel": "YOUR_DISCORD_CHANNEL_ID",
    "plex_url": "YOUR_PLEX_URL",
    "database_file": "YOUR_DATABASE_FILE.db"
}
```

Dzięki temu skryptowi, integracja między Discord a Plex stanie się prostsza i bardziej efektywna.
