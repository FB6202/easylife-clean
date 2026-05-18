# Easy Life – Project Context
> Diese Datei enthält den vollständigen Projektstand. Bei neuer Sitzung diese Datei einlesen.

---

## 1. Projekt Übersicht

**Name:** Easy Life  
**Tagline:** Make it easy  
**Beschreibung:** Persönliche Productivity App – strukturiert den Alltag durch Kategorien, Todos, Ziele, Kalender, Dokumente, Kontakte, Journal und Wochenplanung. Später mit AI-Agent.  
**Entwickler:** Felix (Dev) & Moritz (Idee/Product) – zwei Brüder  
**Logo:** `images/easy-life-logo-light-no-bg.png` (Light Mode, kein Hintergrund)

---

## 2. Tech Stack

### Backend
- **Framework:** Spring Boot 4.0.5 (Spring 7, Hibernate 7)
- **Architektur:** Spring Modulith (Modulith 2.0.5)
- **Sprache:** Java 21
- **Build:** Maven
- **Datenbank:** MySQL (`easylife_db`)
- **ORM:** JPA / Hibernate (`ddl-auto: update` in dev)
- **Migration:** Flyway (später, aktuell noch nicht aktiv)
- **Validierung:** Spring Validation (`@NotBlank`, `@Email` etc.)
- **Mapping:** Manuelle Mapper-Klassen (kein MapStruct)
- **Storage:** AWS S3 (SDK 2.25.0) mit Presigned URLs
- **Auth:** Keycloak (IDP, OAuth2/OIDC) – noch nicht implementiert
- **AI:** Spring AI + OpenAI GPT-4o – noch nicht implementiert

### Frontend
- **Framework:** Angular 21.2
- **Sprache:** TypeScript (strict mode)
- **Styles:** SCSS mit Mixins und CSS Variables
- **Components:** Standalone Components (kein NgModule)
- **State:** Signals (`signal()`, `computed()`)
- **Routing:** Lazy Loading mit `loadComponent`
- **Font:** Rubik (Google Fonts)
- **Icons:** Material Symbols Outlined (Google)
- **SSR:** Aktiviert aber ignoriert für jetzt

---

## 3. Backend – Modulstruktur

```
com.easylife.app
├── users/
│   ├── api/          ← UserApi.java (public interface für andere Module)
│   └── ...
├── categories/
│   ├── api/          ← CategoryApi.java (public interface)
│   └── ...
├── todos/
├── goals/
├── calendar/
├── documents/
├── contacts/
├── notifications/
├── journal/
├── weekplan/
├── storage/
│   ├── api/          ← StorageApi.java (public interface)
│   └── ...
└── shared/
    ├── enums/
    └── dto/
```

### Modulith package-info Abhängigkeiten
- `users` → `shared`
- `categories` → `users::api`, `shared`
- `todos` → `users::api`, `categories::api`, `shared`
- `goals` → `users::api`, `categories::api`, `storage::api`, `shared`
- `calendar` → `users::api`, `categories::api`, `shared`
- `documents` → `users::api`, `categories::api`, `storage::api`, `shared`
- `contacts` → `users::api`, `categories::api`, `shared`
- `notifications` → `users::api`, `todos`, `goals`, `calendar`, `documents`, `contacts`, `journal`, `weekplan`, `shared`
- `journal` → `users::api`, `categories::api`, `shared`
- `weekplan` → `users::api`, `categories::api`, `shared`
- `storage` → `shared`
- `shared` → `@ApplicationModule(type = OPEN)`

---

## 4. Backend – Entities (alle Felder)

### `users` Modul

```java
User {
  Long id;
  String username; // unique
  String email; // unique
  String password;
  String keycloakId; // unique – Keycloak sub
  Boolean locked;
  Boolean emailVerified;
  LocalDateTime createdAt;
  Profile profile; // OneToOne cascade
  Settings settings; // OneToOne cascade
}

Profile {
  Long id;
  String firstname;
  String lastname;
  String profileImagePath; // S3 key
  String bio;
  LocalDateTime createdAt;
  LocalDateTime updatedAt;
  Address address; // OneToOne cascade
}

Address {
  Long id;
  String country;
  String street;
  String number;
  String additionalAddressInfo;
  String zipCode;
  String city;
  LocalDateTime createdAt;
  LocalDateTime updatedAt;
}

Settings {
  Long id;
  Language language; // enum: DE, EN
  ColorTheme webColorTheme; // enum: LIGHT, DARK, SYSTEM
  ColorTheme mobileColorTheme;
  Boolean emailNotifications;
  Boolean pushNotifications;
  LocalDateTime createdAt;
  LocalDateTime updatedAt;
}

Follow {
  Long id;
  Long followerId;
  Long followingId;
  FollowStatus status; // enum: PENDING, ACCEPTED, DECLINED
  LocalDateTime createdAt;
  LocalDateTime updatedAt;
}
```

### `categories` Modul

```java
Category {
  Long id;
  String name;
  String description;
  String color; // hex z.B. "#43a047"
  String icon; // icon name z.B. "rocket"
  AccessType accessType; // enum: PRIVATE, PUBLIC
  LocalDateTime createdAt;
  LocalDateTime updatedAt;
  Long userId;
}
```

### `todos` Modul

```java
Todo {
  Long id;
  String title;
  String description;
  Priority priority; // enum: OPTIONAL, LOW, MEDIUM, HIGH, CRITICAL
  TodoStatus status; // enum: OPEN, IN_PROGRESS, DONE
  AccessType accessType;
  LocalDate dueDate;
  LocalDateTime createdAt;
  LocalDateTime updatedAt;
  Long userId;
  Long weekPlanId; // optional
  List<Long> categoryIds; // max 5, @ElementCollection
}
```

### `goals` Modul

```java
Goal {
  Long id;
  String title;
  String description;
  String imagePath; // S3 key
  String measurableTarget; // z.B. "10km laufen"
  Integer targetValue; // z.B. 100
  String targetUnit; // z.B. "km", "kg", "%"
  Integer currentProgress; // 0-100, manuell oder AI
  LocalDate deadline;
  GoalStatus status; // enum: ACTIVE, COMPLETED, ABANDONED
  AccessType accessType;
  LocalDateTime createdAt;
  LocalDateTime updatedAt;
  Long userId;
  Long weekPlanId; // optional
  List<Long> categoryIds; // max 5
  List<GoalTask> tasks; // OneToMany cascade
}

GoalTask {
  Long id;
  String title;
  String description;
  Boolean done;
  Integer progressContribution; // % Anteil am Gesamtziel
  LocalDate dueDate;
  LocalDateTime createdAt;
  LocalDateTime updatedAt;
  Goal goal; // ManyToOne
}
```

### `calendar` Modul

```java
CalendarEvent {
  Long id;
  String title;
  String description;
  String location;
  String eventColor; // hex
  LocalDateTime startDateTime;
  LocalDateTime endDateTime;
  Boolean allDay;
  EventType eventType; // enum: APPOINTMENT, REMINDER, TASK, BIRTHDAY
  RecurrenceType recurrence; // enum: NONE, DAILY, WEEKLY, MONTHLY, YEARLY
  AccessType accessType;
  LocalDateTime createdAt;
  LocalDateTime updatedAt;
  Long userId;
  List<Long> categoryIds; // max 5
}
```

### `documents` Modul

```java
Document {
  Long id;
  String title;
  String description;
  String filePath; // S3 key
  String fileType; // "pdf", "docx", "png" etc.
  Long fileSizeBytes;
  AccessType accessType;
  LocalDateTime uploadedAt; // statt createdAt
  LocalDateTime updatedAt;
  Long userId;
  List<Long> categoryIds; // max 5
}
```

### `contacts` Modul

```java
Contact {
  Long id;
  String firstname;
  String lastname;
  String company;
  String position;
  String email;
  String phone;
  String linkedinUrl;
  String websiteUrl;
  String notes;
  String tags; // kommagetrennt
  LocalDate lastContactedAt;
  RelationshipType relationshipType; // enum: FRIEND, COLLEAGUE, BUSINESS, MENTOR, OTHER
  LocalDateTime createdAt;
  LocalDateTime updatedAt;
  Long userId;
  List<ContactNote> contactNotes; // OneToMany cascade
  List<Long> categoryIds; // max 5
}

ContactNote {
  Long id;
  String content;
  LocalDateTime createdAt;
  LocalDateTime updatedAt;
  Contact contact; // ManyToOne
}
```

### `notifications` Modul

```java
Notification {
  Long id;
  String title;
  String message;
  NotificationType type; // enum: REMINDER, INFO, WARNING, SUCCESS
  NotificationChannel channel; // enum: IN_APP, EMAIL, PUSH
  ReferenceType referenceType; // enum: TODO, GOAL, EVENT, DOCUMENT, CONTACT, JOURNAL_ENTRY, WEEK_PLAN
  Long referenceId;
  Boolean alreadyRead; // ACHTUNG: nicht "read" (reserviertes MySQL Wort)
  LocalDateTime scheduledAt;
  LocalDateTime sentAt;
  LocalDateTime createdAt;
  LocalDateTime updatedAt;
  Long userId;
}
```

### `journal` Modul

```java
JournalEntry {
  Long id;
  String title;
  MoodLevel mood; // enum: GREAT, GOOD, OKAY, BAD, TERRIBLE
  String wentWell;
  String wentBad;
  String learnings;
  String gratitude;
  LocalDate entryDate; // pro Tag nur ein Eintrag
  LocalDateTime createdAt;
  LocalDateTime updatedAt;
  Long userId;
  List<Long> categoryIds; // max 5
}
```

### `weekplan` Modul

```java
WeekPlan {
  Long id;
  String title;
  String intention; // Fokus der Woche
  LocalDate startDate;
  LocalDate endDate;
  WeekPlanStatus status; // enum: DRAFT, ACTIVE, COMPLETED, ABANDONED
  String reflection; // Abschlussreflexion
  LocalDateTime createdAt;
  LocalDateTime updatedAt;
  Long userId;
  List<Long> categoryIds; // max 5
  // Todos + Goals referenzieren WeekPlan via weekPlanId (nicht umgekehrt)
}
```

---

## 5. Backend – Enums (alle in `shared/enums/`)

```java
AccessType { PRIVATE, PUBLIC }
ColorTheme { LIGHT, DARK, SYSTEM }
EventType { APPOINTMENT, REMINDER, TASK, BIRTHDAY }
FollowStatus { PENDING, ACCEPTED, DECLINED }
GoalStatus { ACTIVE, COMPLETED, ABANDONED }
Language { DE, EN }
MoodLevel { GREAT, GOOD, OKAY, BAD, TERRIBLE }
NotificationChannel { IN_APP, EMAIL, PUSH }
NotificationType { REMINDER, INFO, WARNING, SUCCESS }
Priority { OPTIONAL, LOW, MEDIUM, HIGH, CRITICAL }
RecurrenceType { NONE, DAILY, WEEKLY, MONTHLY, YEARLY }
ReferenceType { TODO, GOAL, EVENT, DOCUMENT, CONTACT, JOURNAL_ENTRY, WEEK_PLAN }
RelationshipType { FRIEND, COLLEAGUE, BUSINESS, MENTOR, OTHER }
TodoStatus { OPEN, IN_PROGRESS, DONE }
WeekPlanStatus { DRAFT, ACTIVE, COMPLETED, ABANDONED }
```

---

## 6. Backend – DTOs (shared/dto/)

```java
// Pagination
PageResponse<T> { List<T> content, int page, int size, long totalElements, int totalPages }

// Error
ErrorResponse { int status, String message, LocalDateTime timestamp }
```

### Modul-spezifische DTOs (jeweils im Modul unter `payload/`)

**users:**
- `UserResponse` (id, keycloakId, username, email, locked, emailVerified, createdAt, ProfileResponse, SettingsResponse)
- `ProfileResponse` (id, firstname, lastname, profileImagePath, bio, AddressResponse)
- `AddressResponse` (id, country, street, number, additionalAddressInfo, zipCode, city)
- `SettingsResponse` (id, language, webColorTheme, mobileColorTheme, emailNotifications, pushNotifications)
- `RegisterUserRequest` (keycloakId, username, email, firstname, lastname) – @NotBlank/@Email
- `ProfileRequest` (firstname, lastname, bio, profileImagePath)
- `AddressRequest` (country, street, number, additionalAddressInfo, zipCode, city)
- `SettingsRequest` (language, webColorTheme, mobileColorTheme, emailNotifications, pushNotifications)

**users/api:**
- `UserSummary` (id, username, keycloakId) – für modulübergreifende Nutzung

**categories:**
- `CategoryResponse` (id, name, description, color, icon, accessType, createdAt)
- `CategoryRequest` (name, description, color, icon, accessType)

**todos:**
- `TodoResponse` (id, title, description, priority, status, accessType, dueDate, createdAt, categoryIds)
- `TodoRequest` (title, description, priority, status, accessType, dueDate, categoryIds)
- `TodoFilter` (status, priority, accessType, dueDateFrom, dueDateTo, categoryIds)

**goals:**
- `GoalResponse` (id, title, description, measurableTarget, targetValue, targetUnit, currentProgress, deadline, status, accessType, createdAt, categoryIds, List<GoalTaskResponse>, presignedImageUrl)
- `GoalTaskResponse` (id, title, description, done, progressContribution, dueDate, createdAt)
- `GoalRequest` (title, description, measurableTarget, targetValue, targetUnit, currentProgress, deadline, status, accessType, categoryIds)
- `GoalTaskRequest` (title, description, done, progressContribution, dueDate)
- `GoalFilter` (status, accessType, deadlineFrom, deadlineTo, categoryIds)

**calendar:**
- `CalendarEventResponse` (id, title, description, location, eventColor, startDateTime, endDateTime, allDay, eventType, recurrence, accessType, createdAt, categoryIds)
- `CalendarEventRequest` (title, description, location, eventColor, startDateTime, endDateTime, allDay, eventType, recurrence, accessType, categoryIds)

**documents:**
- `DocumentResponse` (id, title, description, fileType, fileSizeBytes, accessType, uploadedAt, categoryIds, presignedUrl)
- `DocumentRequest` (title, description, fileType, fileSizeBytes, accessType, categoryIds)
- `DocumentFilter` (fileType, accessType, uploadedFrom, uploadedTo, categoryIds)

**contacts:**
- `ContactResponse` (id, firstname, lastname, company, position, email, phone, linkedinUrl, websiteUrl, notes, tags, lastContactedAt, createdAt, relationshipType, List<ContactNoteResponse>, categoryIds)
- `ContactNoteResponse` (id, content, createdAt)
- `ContactRequest` (firstname, lastname, company, position, email, phone, linkedinUrl, websiteUrl, notes, tags, lastContactedAt, relationshipType, categoryIds)
- `ContactNoteRequest` (content)
- `ContactFilter` (relationshipType, company, categoryIds)

**notifications:**
- `NotificationResponse` (id, title, message, type, channel, referenceType, referenceId, alreadyRead, scheduledAt, sentAt, createdAt)
- `NotificationRequest` (title, message, type, channel, referenceType, referenceId, scheduledAt)
- `NotificationFilter` (type, channel, alreadyRead, referenceType)

**journal:**
- `JournalEntryResponse` (id, title, mood, wentWell, wentBad, learnings, gratitude, entryDate, createdAt, updatedAt, categoryIds)
- `JournalEntryRequest` (title, mood, wentWell, wentBad, learnings, gratitude, entryDate, categoryIds)
- `JournalFilter` (mood, entryDateFrom, entryDateTo, categoryIds)

**weekplan:**
- `WeekPlanResponse` (id, title, intention, startDate, endDate, status, reflection, createdAt, updatedAt, categoryIds)
- `WeekPlanRequest` (title, intention, startDate, endDate, status, reflection, categoryIds)
- `WeekPlanFilter` (status, startDateFrom, startDateTo, categoryIds)

**follows (in users):**
- `FollowResponse` (id, followerId, followerUsername, followingId, followingUsername, status, createdAt)
- `FollowRequest` (followingId)

---

## 7. Backend – Services & Controller (API v1)

### Konventionen
- Alle Controller unter `/api/v1/...`
- Service Interface + ServiceImpl (package-private)
- Pagination mit `PageResponse<T>` für: todos, goals, documents, contacts, notifications, journal, weekplan
- Filter mit `@ModelAttribute` und JPA Specifications
- `userId` immer als `@RequestParam` (Security kommt später)

### Endpoints Übersicht

```
POST   /api/v1/users/register
GET    /api/v1/users/{id}
GET    /api/v1/users/keycloak/{keycloakId}
PUT    /api/v1/users/{id}/profile
PUT    /api/v1/users/{id}/address
PUT    /api/v1/users/{id}/settings
POST   /api/v1/users/{id}/profile-image/presigned-url
PATCH  /api/v1/users/{id}/profile-image/confirm

GET/POST/PUT/DELETE  /api/v1/categories
GET/POST/PUT/DELETE  /api/v1/todos
GET/POST/PUT/DELETE  /api/v1/goals
PATCH  /api/v1/goals/{id}/progress
POST   /api/v1/goals/{id}/image/presigned-url
PATCH  /api/v1/goals/{id}/image/confirm
POST/PUT/DELETE      /api/v1/goals/{goalId}/tasks/{taskId}

GET/POST/PUT/DELETE  /api/v1/calendar
GET    /api/v1/calendar/range?from=&to=

GET/POST/PUT/DELETE  /api/v1/documents
POST   /api/v1/documents/presigned-url
POST   /api/v1/documents/confirm-upload

GET/POST/PUT/DELETE  /api/v1/contacts
POST/PUT/DELETE      /api/v1/contacts/{contactId}/notes/{noteId}

GET/POST/DELETE      /api/v1/notifications
PATCH  /api/v1/notifications/{id}/read
PATCH  /api/v1/notifications/read-all
GET    /api/v1/notifications/unread
GET    /api/v1/notifications/unread/count

GET/POST/PUT/DELETE  /api/v1/journal
GET    /api/v1/journal/date/{date}

GET/POST/PUT/DELETE  /api/v1/weekplans
PATCH  /api/v1/weekplans/{id}/status
PATCH  /api/v1/weekplans/{id}/reflection

POST   /api/v1/follows
PATCH  /api/v1/follows/{id}/accept
PATCH  /api/v1/follows/{id}/decline
DELETE /api/v1/follows/{followingId}
GET    /api/v1/follows/followers
GET    /api/v1/follows/following
GET    /api/v1/follows/pending
GET    /api/v1/follows/is-following
```

---

## 8. Backend – AWS S3 / Storage

```
storage/
├── api/
│   └── StorageApi.java (public interface)
│       - generateUploadUrl(key, contentType): String
│       - generateDownloadUrl(key): String
│       - delete(key): void
│       - buildKey(username, entityType, entityId, fileName): String
├── S3Config.java (@Profile("dev") StaticCredentials, @Profile("staging|prod") DefaultCredentialsProvider)
├── S3Properties.java (@ConfigurationProperties prefix="aws.s3")
│   - bucketName, region, accessKey (dev only), secretKey (dev only)
│   - uploadUrlExpirationMinutes (5), downloadUrlExpirationMinutes (60/30 prod)
├── S3ServiceImpl.java (implements StorageApi)
└── S3Constants.java
    - ALLOWED_FILENAME_CHARS = "[^a-zA-Z0-9._-]"
    - REPLACEMENT_CHAR = "_"
```

**S3 Key Format:** `{username}/{entityType}/{entityId}/{uuid8}_{sanitizedFileName}`  
Beispiel: `felix/documents/42/a1b2c3d4_rechnung.pdf`

**Upload Flow:**
1. Frontend → Backend: POST presigned-url (fileName, contentType)
2. Backend → S3: Presigned Upload URL generieren (5 min gültig)
3. Backend → Frontend: uploadUrl zurück
4. Frontend → S3: PUT direkt mit Datei (kein AWS SDK nötig)
5. Frontend → Backend: POST confirm-upload (filePath)
6. Backend: speichert filePath in DB

---

## 9. Backend – application.yml Konfiguration

```yaml
# application.yml (Basis)
spring:
  application:
    name: easy-life
  profiles:
    active: dev

# application-dev.yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/easylife_db
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
aws:
  s3:
    access-key: ${AWS_ACCESS_KEY}
    secret-key: ${AWS_SECRET_KEY}
    bucket-name: ${AWS_BUCKET_NAME}
    region: ${AWS_REGION}
    upload-url-expiration-minutes: 5
    download-url-expiration-minutes: 60
cors:
  allowed-origins: http://localhost:4200

# application-staging.yml / application-prod.yml
# ddl-auto: validate, flyway: enabled, keine StaticCredentials
# cors: https://staging.easylife.app / https://easylife.app
# prod download-url-expiration-minutes: 30
```

---

## 10. Backend – Exception Handling & CORS

```java
// GlobalExceptionHandler (@RestControllerAdvice) in config/exception/
// Behandelt: EntityNotFoundException → 404
//            IllegalArgumentException → 400
//            MethodArgumentNotValidException → 400 (Validation)
//            AccessDeniedException → 403
//            Exception → 500

// CorsConfig in config/
// Liest cors.allowed-origins aus application-{env}.yml
// Erlaubt: GET, POST, PUT, PATCH, DELETE, OPTIONS
// allowCredentials: true
```

---

## 11. Backend – Noch nicht implementiert (kommt später)

- **Security:** Spring Security + Keycloak JWT Integration
- **AI Agent:** Spring AI + OpenAI GPT-4o, Tool Calling, SSE Streaming
- **Subscription/Billing:** Stripe, SubscriptionPlan (FREE/PLUS/PRO), Limits enforcement
- **Flyway:** DB Migrationen für prod
- **Email Notifications:** spring-boot-starter-mail
- **Google Calendar Sync:** googleEventId Feld in CalendarEvent

### Subscription Pläne (geplant)
| Feature | Free | Plus (7,99€/Mo) | Pro (14,99€/Mo) |
|---|---|---|---|
| Tasks | 50 | Unlimited | Unlimited |
| Categories | 10 | Unlimited | Unlimited |
| Goals | 5 | Unlimited | Unlimited |
| Storage | 500MB | 10GB | 50GB |
| AI Agent | ❌ | Basic ✅ | Full ✅ |
| Network/Following | ❌ | ✅ | ✅ |
| Support | Community | Email | Priority |

Yearly: 2 Monate gratis (~÷12×10)

---

## 12. Frontend – Projektstruktur

```
src/
├── index.html (Rubik Font + Material Symbols Outlined via Google Fonts)
├── styles.scss (importiert: _variables, _mixins, _base)
├── styles/
│   ├── _variables.scss (CSS vars für light/dark, SCSS vars für spacing/typography)
│   ├── _mixins.scss (flex, card, button, badge, input, sidebar, progress-bar etc.)
│   └── _base.scss (reset, utility classes, modal, form, empty-state)
└── app/
    ├── app.ts (nur RouterOutlet)
    ├── app.routes.ts (lazy loading)
    ├── layouts/
    │   ├── public-layout/ (wrapper für public pages)
    │   └── workspace-layout/ (sidebar + topbar + router-outlet)
    ├── shared/
    │   └── components/
    │       ├── navbar/ (NavbarComponent – public navbar)
    │       └── footer/ (FooterComponent – public footer)
    └── pages/
        ├── public/
        │   ├── welcome/   ✅ fertig
        │   ├── register/  ✅ fertig
        │   ├── pricing/   ✅ fertig
        │   ├── about/     ✅ fertig
        │   └── support/   ✅ fertig
        └── workspace/
            ├── dashboard/      ⬜ als nächstes
            ├── tasks/          ⬜
            ├── categories/     ⬜
            ├── goals/          ⬜
            ├── calendar/       ⬜
            ├── documents/      ⬜
            ├── profile/        ⬜
            ├── network/        ⬜
            ├── following/      ⬜
            ├── notifications/  ⬜
            ├── weekplan/       ⬜
            └── journal/        ⬜
```

**Wichtig:** Files heißen in Angular 21 OHNE `.component` Suffix:
- `welcome.ts` (nicht `welcome.component.ts`)
- `welcome.html` (nicht `welcome.component.html`)
- `welcome.scss` (nicht `welcome.component.scss`)

---

## 13. Frontend – Design System

### Farben (CSS Variables)
```scss
// Light Mode (default)
--color-primary: #43a047
--color-primary-dark: #1b5e20
--color-primary-light: #e8f5e9
--color-primary-hover: #388e3c
--color-bg: #f5f7f5
--color-bg-card: #ffffff
--color-bg-sidebar: #ffffff
--color-text-primary: #1a1a1a
--color-text-secondary: #5f6368
--color-text-muted: #9aa0a6
--color-border: #e0e0e0

// Dark Mode ([data-theme="dark"])
--color-primary: #66bb6a
--color-bg: #0f1115
--color-bg-card: #1a1e24
--color-bg-sidebar: #141820
--color-text-primary: #e8eaed
```

### Priority Farben
- CRITICAL: `#d32f2f` (red)
- HIGH: `#f57c00` (orange)
- MEDIUM: `#f9a825` (yellow)
- LOW: `#1976d2` (blue)
- OPTIONAL: `#757575` (gray)

### Typography
- Font: Rubik
- Sizes: xs(12px), sm(14px), base(16px), md(18px), lg(20px), xl(24px), 2xl(32px), 3xl(40px), 4xl(48px)

### Spacing: $space-1(4px) bis $space-16(64px)
### Border Radius: $radius-sm(6px), md(10px), lg(16px), xl(24px), pill(999px), full(50%)

---

## 14. Frontend – Routing (app.routes.ts)

```typescript
// Public (kein Login nötig)
'' → WelcomeComponent
'register' → RegisterComponent
'pricing' → PricingComponent
'about' → AboutComponent
'support' → SupportComponent

// Workspace (Login nötig, AuthGuard kommt später)
'workspace/dashboard' → DashboardComponent
'workspace/tasks' → TasksComponent (+ /:id)
'workspace/categories' → CategoriesComponent (+ /:id)
'workspace/goals' → GoalsComponent (+ /:id)
'workspace/calendar' → CalendarComponent (+ /:id)
'workspace/documents' → DocumentsComponent (+ /:id)
'workspace/my-week' → WeekplanComponent (+ /:id)
'workspace/journal' → JournalComponent (+ /:id)
'workspace/profile' → ProfileComponent
'workspace/network' → NetworkComponent (+ /:id)
'workspace/following' → FollowingComponent
'workspace/notifications' → NotificationsComponent (+ /:id)

// Modals öffnen über Query Params:
// /workspace/tasks?create=true → Create Modal
// /workspace/tasks/:id → Details Modal
```

---

## 15. Frontend – WorkspaceLayout Sidebar Navigation

```typescript
// MANAGEMENT Section
{ label: 'Dashboard', route: '/workspace/dashboard', icon: 'grid_view' }
{ label: 'Tasks', route: '/workspace/tasks', icon: 'check_circle' }
{ label: 'Categories', route: '/workspace/categories', icon: 'category' }
{ label: 'Goals', route: '/workspace/goals', icon: 'flag' }
{ label: 'Calendar', route: '/workspace/calendar', icon: 'calendar_month' }
{ label: 'Documents', route: '/workspace/documents', icon: 'description' }
{ label: 'My Week', route: '/workspace/my-week', icon: 'view_week' }
{ label: 'Journal', route: '/workspace/journal', icon: 'menu_book' }

// ACCOUNT Section
{ label: 'Profile', route: '/workspace/profile', icon: 'person' }
{ label: 'Network', route: '/workspace/network', icon: 'people' }
{ label: 'Following', route: '/workspace/following', icon: 'person_add' }
{ label: 'Notifications', route: '/workspace/notifications', icon: 'notifications' }

// Footer
Logout Button
```

---

## 16. Frontend – Public Pages Status

### Welcome Page ✅
- Navbar (sticky, blur backdrop)
- Hero (Headline + Subtitle + 2 CTAs + App Preview Placeholder)
- Features Grid (4 Cards: Smart Tasks, Goal Tracking, Calendar, AI Assistant)
- CTA Section (grüner Hintergrund)
- Footer

### Register Page ✅
- Nutzt NavbarComponent + FooterComponent
- Form: firstname + lastname (nebeneinander), username (@-Icon), email, password (eye toggle), confirm password
- Terms Checkbox, Create Account Button, "Already have account?" Login Link
- Signals für showPassword, agreedToTerms, form

### Pricing Page ✅
- Yearly/Monthly Toggle (Signal)
- 3 Plan Cards: Free / Plus (7,99€) / Pro (14,99€)
- Mittlere Card highlighted (Most Popular Badge, elevated)
- FAQ Section als Cards mit Icons
- Yearly Preise: Plus 5,58€/Mo, Pro 10,49€/Mo

### About Page ✅
- Hero (grüner Gradient wie Support)
- Stats Row (5+ Ways, 1 Place, ∞ AI, 0 Reasons)
- Problem Section (Text + App Chaos Visual)
- Solution Section (Text + Hub Visual mit Verbindungslinien)
- Values (4 Cards)
- Team Section (Felix + Moritz mit Avatar Cards)
- CTA (grüner Gradient)

### Support Page ✅
- Hero (grüner Gradient, Suchleiste, Tags)
- Browse by Topic (6 Kategorie Cards mit Artikel-Anzahl)
- FAQ (Accordion mit open/close Signal)
- Contact Section (3 Cards: Email, AI, Community)

---

## 17. Frontend – Nächste Schritte

1. **WorkspaceLayout** – HTML/SCSS fertigstellen
2. **Dashboard** – Widgets: Open Tasks, Schedule, Goals, Notifications, Categories
3. **Tasks Page** – Liste + Create/Edit Modal
4. **Categories Page** – Grid + Create/Edit Modal
5. **Goals Page** – Cards mit Progress + Modal
6. **Calendar Page** – Monats/Wochen/Tagesansicht
7. **Documents Page** – Liste + Upload Modal
8. **Profile Page** – Direkt editierbar
9. **Network Page** – Kontakte Liste + Details
10. **Following Page** – Tabs: Following/Followers/Pending
11. **Weekplan Page** – Liste + Detail mit verknüpften Todos/Goals
12. **Journal Page** – Liste + Entry Detail

---

## 18. Wichtige Entscheidungen & Konventionen

- **Keycloak:** Login läuft über Keycloak Redirect (nicht eigene Login Page). Keycloakify für Custom Theme.
- **userId:** Wird immer als `@RequestParam` übergeben bis Security implementiert ist. Später aus JWT Security Context.
- **Kategorien:** Max 5 pro Item, werden als `categoryIds: List<Long>` gespeichert, Validierung via CategoryApi.
- **Follow System:** Accept-Mechanismus erforderlich. Nur public Goals + Categories sichtbar für Follower (keine Todos).
- **Pagination:** Todos, Goals, Documents, Contacts, Notifications, Journal, WeekPlan haben Pagination. Categories + Calendar nicht.
- **`alreadyRead`:** In Notification Entity heißt das Feld `alreadyRead` (nicht `read` – MySQL reserved word).
- **S3 Keys:** Nie vollständige URLs in DB speichern, nur den Key. URL wird frisch als Presigned URL generiert.
- **Angular Files:** KEIN `.component` Suffix – `welcome.ts` nicht `welcome.component.ts`.
- **Theme Default:** Dark Mode ist der Default für die App (Workspace). Public Pages sind Light Mode.
- **Logo Pfad:** `images/easy-life-logo-light-no-bg.png` (nicht assets/logos/)

---

## 19. Infrastruktur (geplant, noch nicht umgesetzt)

```
Route 53 → CloudFront → S3 (Angular)
                      → ALB → ECS (Spring Boot)
                             → ECS (Keycloak)
                                    ↓
                                RDS MySQL
                                (easylife_db + keycloak_db)
```

- **Dev:** StaticCredentials via Env Vars
- **Staging/Prod:** IAM Role via EC2/ECS Instance Profile
- **CI/CD:** GitHub Actions → ECR → ECS Deploy
- **Domain:** easylife.app (geplant)

---

*Zuletzt aktualisiert: April 2026*
