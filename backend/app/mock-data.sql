-- ============================================================
-- Easy Life — Mock Data
-- HeidiSQL / MySQL · Reihenfolge beachten (FK-Constraints)
-- Hauptuser: felix_mueller (id=1)
-- Netzwerk:  sarah_creates (2), jan_datadev (3), lena_builds (4)
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. ADDRESSES
-- ============================================================
INSERT INTO addresses (id, country, street, number, additional_address_info, zip_code, city, created_at, updated_at) VALUES
                                                                                                                         (1, 'Germany', 'Königsallee',    '42',  NULL,          '40212', 'Düsseldorf', '2024-01-10 09:00:00', NULL),
                                                                                                                         (2, 'Germany', 'Schillerstraße', '7',   'Apt. 3B',     '10629', 'Berlin',     '2024-02-01 10:00:00', NULL),
                                                                                                                         (3, 'Germany', 'Eppendorfer Weg','115', NULL,          '20259', 'Hamburg',    '2024-03-15 11:00:00', NULL),
                                                                                                                         (4, 'Germany', 'Maximilianstr.', '22',  NULL,          '80539', 'Munich',     '2024-04-01 12:00:00', NULL);

-- ============================================================
-- 2. SETTINGS
-- ============================================================
INSERT INTO settings (id, language, web_color_theme, mobile_color_theme, email_notifications, push_notifications, created_at, updated_at) VALUES
                                                                                                                                              (1, 'DE', 'LIGHT',  'SYSTEM', 1, 1, '2024-01-10 09:00:00', NULL),
                                                                                                                                              (2, 'EN', 'LIGHT',  'LIGHT',  1, 0, '2024-02-01 10:00:00', NULL),
                                                                                                                                              (3, 'DE', 'DARK',   'DARK',   1, 1, '2024-03-15 11:00:00', NULL),
                                                                                                                                              (4, 'EN', 'SYSTEM', 'LIGHT',  0, 1, '2024-04-01 12:00:00', NULL);

-- ============================================================
-- 3. PROFILES
-- (mobileNumber wurde neu hinzugefügt — Spalte muss existieren)
-- ============================================================
INSERT INTO profiles (id, firstname, lastname, profile_image_path, bio, mobile_number, address_id, created_at, updated_at) VALUES
                                                                                                                               (1, 'Felix',  'Müller',   NULL, 'Building Easy Life — a productivity suite for intentional people. Passionate about deep work, systems thinking and great software.', '+49 151 12345678', 1, '2024-01-10 09:00:00', '2025-11-20 14:30:00'),
                                                                                                                               (2, 'Sarah',  'Creates',  NULL, 'Product designer & creative director. Building beautiful things one pixel at a time. Passionate about design systems and UX.', NULL, 2, '2024-02-01 10:00:00', NULL),
                                                                                                                               (3, 'Jan',    'Datadev',  NULL, 'Full-stack developer & data engineer. Loves clean code, good coffee and building side projects that actually ship.', '+49 176 98765432', 3, '2024-03-15 11:00:00', NULL),
                                                                                                                               (4, 'Lena',   'Builds',   NULL, 'Startup founder & product strategist. Helping teams ship faster without burning out. Ex-BCG, now full-time builder.', NULL, 4, '2024-04-01 12:00:00', NULL);

-- ============================================================
-- 4. USERS
-- ============================================================
INSERT INTO users (id, username, email, keycloak_id, locked, email_verified, created_at, profile_id, settings_id) VALUES
                                                                                                                      (1, 'felix_mueller',  'felix@easylife.app',  'kc-felix-0001',  0, 1, '2024-01-10 09:00:00', 1, 1),
                                                                                                                      (2, 'sarah_creates',  'sarah@easylife.app',  'kc-sarah-0002',  0, 1, '2024-02-01 10:00:00', 2, 2),
                                                                                                                      (3, 'jan_datadev',    'jan@easylife.app',    'kc-jan-0003',    0, 1, '2024-03-15 11:00:00', 3, 3),
                                                                                                                      (4, 'lena_builds',    'lena@easylife.app',   'kc-lena-0004',   0, 1, '2024-04-01 12:00:00', 4, 4);

-- ============================================================
-- 5. CATEGORIES  (für User 1: felix)
-- ============================================================
INSERT INTO categories (id, name, description, color, icon, access_type, user_id, created_at, updated_at) VALUES
-- Felix (1)
(1,  'Work',         'Alles rund um Easy Life und Arbeitsprojekte.',     '#1976d2', 'work',            'PUBLIC',  1, '2024-01-10 09:05:00', NULL),
(2,  'Finance',      'Budget, Investitionen und finanzielle Ziele.',      '#f57c00', 'payments',        'PRIVATE', 1, '2024-01-10 09:06:00', NULL),
(3,  'Personal',     'Private Ziele, Gewohnheiten und Reflexionen.',      '#9c27b0', 'person',          'PRIVATE', 1, '2024-01-10 09:07:00', NULL),
(4,  'Health',       'Sport, Ernährung und mentale Gesundheit.',          '#43a047', 'self_improvement', 'PUBLIC',  1, '2024-01-10 09:08:00', NULL),
(5,  'Learning',     'Bücher, Kurse und neue Fähigkeiten.',              '#00bcd4', 'school',          'PUBLIC',  1, '2024-01-10 09:09:00', NULL),
(6,  'Side Projects','Nebenprojekte und kreative Experimente.',           '#e91e63', 'code',            'PUBLIC',  1, '2024-01-10 09:10:00', NULL),
-- Sarah (2)
(7,  'Design Work',  'Client projects, design system, component libs.',   '#e91e63', 'design_services', 'PUBLIC',  2, '2024-02-01 10:05:00', NULL),
(8,  'Learning',     'Courses, books and skill development.',             '#9c27b0', 'school',          'PUBLIC',  2, '2024-02-01 10:06:00', NULL),
-- Jan (3)
(9,  'Development',  'Code, architecture and engineering topics.',        '#43a047', 'code',            'PUBLIC',  3, '2024-03-15 11:05:00', NULL),
(10, 'Data',         'Data pipelines, analytics and ML experiments.',     '#1976d2', 'bar_chart',       'PUBLIC',  3, '2024-03-15 11:06:00', NULL),
-- Lena (4)
(11, 'Startup',      'Strategy, fundraising and team building.',          '#795548', 'rocket_launch',   'PUBLIC',  4, '2024-04-01 12:05:00', NULL),
(12, 'Health',       'Fitness, mindfulness and energy management.',       '#43a047', 'self_improvement', 'PRIVATE', 4, '2024-04-01 12:06:00', NULL);

-- ============================================================
-- 6. FOLLOWS
-- ============================================================
INSERT INTO follows (id, follower_id, following_id, status, created_at, updated_at) VALUES
                                                                                        (1, 1, 2, 'ACCEPTED', '2024-06-01 10:00:00', '2024-06-01 10:05:00'), -- felix → sarah  ✓
                                                                                        (2, 1, 4, 'ACCEPTED', '2024-07-15 09:00:00', '2024-07-15 09:10:00'), -- felix → lena   ✓
                                                                                        (3, 2, 1, 'ACCEPTED', '2024-06-02 08:00:00', '2024-06-02 08:05:00'), -- sarah → felix  ✓
                                                                                        (4, 3, 1, 'PENDING',  '2025-12-01 14:00:00', NULL),                  -- jan →  felix  (pending)
                                                                                        (5, 1, 3, 'ACCEPTED', '2025-01-10 11:00:00', '2025-01-10 11:15:00'); -- felix → jan    ✓

-- ============================================================
-- 7. GOALS  (User 1: felix)
-- ============================================================
INSERT INTO goals (id, title, description, measurable_target, target_value, target_unit, current_progress, deadline, status, access_type, image_path, week_plan_id, user_id, created_at, updated_at) VALUES
                                                                                                                                                                                                         (1, 'Easy Life MVP launchen',
                                                                                                                                                                                                          'Vollständige erste Version von Easy Life fertigstellen und live bringen — Frontend, Backend, Auth, Payment.',
                                                                                                                                                                                                          'Alle Core-Features live & stabil', 100, '%', 65,
                                                                                                                                                                                                          '2026-06-30', 'ACTIVE', 'PUBLIC', NULL, NULL, 1, '2024-01-15 10:00:00', '2026-04-20 09:00:00'),

                                                                                                                                                                                                         (2, '10 km unter 50 Minuten laufen',
                                                                                                                                                                                                          'Regelmäßiges Training aufbauen und die 10km-Marke in unter 50 Minuten schaffen.',
                                                                                                                                                                                                          '10 km in < 50 min', 50, 'min', 55,
                                                                                                                                                                                                          '2026-09-01', 'ACTIVE', 'PUBLIC', NULL, NULL, 1, '2025-01-01 08:00:00', '2026-03-15 07:30:00'),

                                                                                                                                                                                                         (3, '24 Bücher in 2026 lesen',
                                                                                                                                                                                                          'Mindestens 2 Bücher pro Monat lesen — Sachbücher, Biographien und Romane.',
                                                                                                                                                                                                          '24 Bücher gelesen', 24, 'Bücher', 8,
                                                                                                                                                                                                          '2026-12-31', 'ACTIVE', 'PUBLIC', NULL, NULL, 1, '2026-01-01 00:00:00', '2026-04-01 19:00:00'),

                                                                                                                                                                                                         (4, '€ 15.000 Notgroschen aufbauen',
                                                                                                                                                                                                          '6-Monats-Puffer aufbauen und automatisiertes Sparen etablieren.',
                                                                                                                                                                                                          '€ 15.000 auf Tagesgeldkonto', 15000, '€', 6800,
                                                                                                                                                                                                          '2026-12-31', 'ACTIVE', 'PRIVATE', NULL, NULL, 1, '2026-01-01 00:00:00', '2026-04-15 10:00:00');

-- goal_categories
INSERT INTO goal_categories (goal_id, category_id) VALUES
                                                       (1, 1), (1, 6),  -- Easy Life MVP → Work, Side Projects
                                                       (2, 4),          -- Laufen → Health
                                                       (3, 5),          -- Bücher → Learning
                                                       (4, 2);          -- Notgroschen → Finance

-- ============================================================
-- 8. GOAL TASKS
-- ============================================================
INSERT INTO goal_tasks (id, title, description, done, progress_contribution, due_date, goal_id, created_at, updated_at) VALUES
-- Easy Life MVP (goal_id=1)
(1,  'Backend API vollständig', 'Alle Endpunkte implementiert und getestet', 0, 20, '2026-05-15', 1, '2024-01-15 10:00:00', NULL),
(2,  'Frontend Services verbinden', 'Mock-Daten durch echte API ersetzen',   0, 25, '2026-05-30', 1, '2024-01-15 10:00:00', NULL),
(3,  'Keycloak Auth integriert',    'Login, Logout, Refresh Token',           1, 15, '2026-04-01', 1, '2024-01-15 10:00:00', '2026-04-02 11:00:00'),
(4,  'Deployment auf AWS',          'EC2 + RDS + S3 produktionsbereit',       0, 20, '2026-06-15', 1, '2024-01-15 10:00:00', NULL),
(5,  'Stripe Payment live',         'Subscription-Flow komplett',             0, 20, '2026-06-28', 1, '2024-01-15 10:00:00', NULL),
-- 10km Laufen (goal_id=2)
(6,  'Woche 1–4: Basis aufbauen',  '3x pro Woche 30 min laufen',            1, 20, '2026-02-28', 2, '2025-01-01 08:00:00', '2026-03-01 07:00:00'),
(7,  'Woche 5–8: Distanz steigern','5km ohne Pause',                         1, 20, '2026-03-31', 2, '2025-01-01 08:00:00', '2026-04-01 07:00:00'),
(8,  'Woche 9–12: Pace verbessern','Unter 5:30 min/km',                      0, 30, '2026-05-31', 2, '2025-01-01 08:00:00', NULL),
(9,  '10km Testlauf',              'Offizieller Testlauf und Zeit messen',    0, 30, '2026-08-15', 2, '2025-01-01 08:00:00', NULL),
-- Bücher (goal_id=3)
(10, 'Q1: 6 Bücher',              'Jan–Mär 2026',                            1, 25, '2026-03-31', 3, '2026-01-01 00:00:00', '2026-04-01 10:00:00'),
(11, 'Q2: 6 Bücher',              'Apr–Jun 2026',                            0, 25, '2026-06-30', 3, '2026-01-01 00:00:00', NULL),
(12, 'Q3: 6 Bücher',              'Jul–Sep 2026',                            0, 25, '2026-09-30', 3, '2026-01-01 00:00:00', NULL),
(13, 'Q4: 6 Bücher',              'Okt–Dez 2026',                            0, 25, '2026-12-31', 3, '2026-01-01 00:00:00', NULL);

-- ============================================================
-- 9. TODOS  (User 1: felix)
-- ============================================================
INSERT INTO todos (id, title, description, priority, status, access_type, due_date, week_plan_id, user_id, created_at, updated_at) VALUES
                                                                                                                                       (1,  'UserSearch Endpoint testen',         'Alle Edge Cases prüfen (leere Query, Sonderzeichen)', 'HIGH',     'IN_PROGRESS', 'PRIVATE', '2026-05-14', 1, 1, '2026-05-10 09:00:00', '2026-05-12 08:00:00'),
                                                                                                                                       (2,  'Frontend Services aufbauen',         'HTTP-Services für alle API-Endpunkte erstellen',      'CRITICAL', 'OPEN',        'PRIVATE', '2026-05-20', 1, 1, '2026-05-10 09:05:00', NULL),
                                                                                                                                       (3,  'Keycloak lokal aufsetzen',           'Docker Compose Konfiguration für lokale Entwicklung', 'HIGH',     'OPEN',        'PRIVATE', '2026-05-18', 1, 1, '2026-05-10 09:10:00', NULL),
                                                                                                                                       (4,  'Laufschuhe kaufen',                  'Brooks Ghost 16 oder Asics Gel-Nimbus 26',            'MEDIUM',   'DONE',        'PRIVATE', '2026-04-30', NULL, 1, '2026-04-20 10:00:00', '2026-04-25 15:00:00'),
                                                                                                                                       (5,  '"Atomic Habits" fertig lesen',       'Letzten 3 Kapitel und Zusammenfassung schreiben',     'MEDIUM',   'DONE',        'PRIVATE', '2026-04-15', NULL, 1, '2026-04-01 08:00:00', '2026-04-14 22:00:00'),
                                                                                                                                       (6,  'Monatliches Budget April prüfen',    'Ausgaben vs. Plan vergleichen und Abweichungen notieren','LOW',   'DONE',        'PRIVATE', '2026-05-05', NULL, 1, '2026-05-01 07:00:00', '2026-05-05 20:00:00'),
                                                                                                                                       (7,  'API-Dokumentation aktualisieren',    'Neue Endpoints in Docs aufnehmen',                    'MEDIUM',   'OPEN',        'PUBLIC',  '2026-05-25', 1, 1, '2026-05-10 09:15:00', NULL),
                                                                                                                                       (8,  'Datenbankindizes prüfen',            'Performance bei größeren Datensätzen testen',          'LOW',      'OPEN',        'PRIVATE', '2026-05-31', NULL, 1, '2026-05-10 09:20:00', NULL),
                                                                                                                                       (9,  'Stripe Sandbox einrichten',          'Test-API-Keys und Webhook konfigurieren',              'HIGH',     'OPEN',        'PRIVATE', '2026-05-22', 1, 1, '2026-05-10 09:25:00', NULL),
                                                                                                                                       (10, 'Dark Mode Logo finalisieren',        'SVG für Light und Dark Variante exportieren',          'MEDIUM',   'IN_PROGRESS', 'PRIVATE', '2026-05-16', 1, 1, '2026-05-10 09:30:00', '2026-05-11 10:00:00'),
                                                                                                                                       (11, 'Easy Life Social Media Profile',     'Instagram + LinkedIn Account anlegen',                 'LOW',      'OPEN',        'PUBLIC',  '2026-06-01', NULL, 1, '2026-05-10 09:35:00', NULL),
                                                                                                                                       (12, 'Security Audit vorbereiten',         'Checkliste für Backend-Security zusammenstellen',      'HIGH',     'OPEN',        'PRIVATE', '2026-05-28', NULL, 1, '2026-05-10 09:40:00', NULL);

-- todo_categories
INSERT INTO todo_categories (todo_id, category_id) VALUES
                                                       (1, 1), (1, 6),
                                                       (2, 1), (2, 6),
                                                       (3, 1),
                                                       (4, 4),
                                                       (5, 5),
                                                       (6, 2),
                                                       (7, 1),
                                                       (8, 1),
                                                       (9, 1), (9, 2),
                                                       (10, 1), (10, 6),
                                                       (11, 1),
                                                       (12, 1);

-- ============================================================
-- 10. JOURNAL ENTRIES  (User 1: felix)
-- ============================================================
INSERT INTO journal_entries (id, title, went_well, went_bad, learnings, gratitude, mood, entry_date, week_plan_id, user_id, created_at, updated_at) VALUES
                                                                                                                                                        (1, 'Produktiver Start in die Woche',
                                                                                                                                                         'UserSearch Endpoint fertig implementiert und direkt getestet. Code-Review mit Jan war super konstruktiv.',
                                                                                                                                                         'Deployment hat beim ersten Versuch nicht geklappt — Docker-Config war fehlerhaft.',
                                                                                                                                                         'Immer zuerst lokal in einem sauberen Container testen, bevor man live deployt.',
                                                                                                                                                         'Dass Jan trotz eigenem Stress Zeit für ein Review hatte. Gutes Team.',
                                                                                                                                                         'GREAT', '2026-05-11', 1, 1, '2026-05-11 21:30:00', NULL),

                                                                                                                                                        (2, 'Durchhänger am Mittwoch',
                                                                                                                                                         'Dark Mode Komponenten fast fertig. Laufen war gut — 6km in 32 Minuten.',
                                                                                                                                                         'Konzentration war nach dem Mittag komplett weg. Social Media hat zu viel Zeit gefressen.',
                                                                                                                                                         'Handy nach 14 Uhr in Do-Not-Disturb. Pomodoro wieder konsequenter einsetzen.',
                                                                                                                                                         'Trotzdem einen klaren Kopf abends gehabt und noch etwas gelesen.',
                                                                                                                                                         'OK', '2026-05-07', 1, 1, '2026-05-07 22:00:00', NULL),

                                                                                                                                                        (3, 'Bestes Wochenende seit Langem',
                                                                                                                                                         'Atomic Habits fertig gelesen. Wanderung im Bergischen Land mit David war klasse. Gutes Gespräch über Vision und Ziele.',
                                                                                                                                                         'Budget-Tracking vergessen — jetzt nachgeholt, aber besser direkt machen.',
                                                                                                                                                         'Offline-Zeit ist echte Regeneration. Das muss ich öfter einplanen statt nur darüber nachzudenken.',
                                                                                                                                                         'David, das gute Wetter und die Tatsache, dass ich wirklich regeneriert bin.',
                                                                                                                                                         'GREAT', '2026-04-27', NULL, 1, '2026-04-27 20:00:00', NULL),

                                                                                                                                                        (4, 'Fokus auf den Kern',
                                                                                                                                                         'Klare Prioritätenliste für Mai erstellt. Backend-Review mit Felix ergab einige gute Optimierungen.',
                                                                                                                                                         'Zu viele parallele Baustellen — muss ich eingrenzen.',
                                                                                                                                                         'Weniger ist mehr. 3 Prioritäten pro Woche, nicht 10.',
                                                                                                                                                         'Das Gefühl, wenn ein Feature endlich vollständig funktioniert.',
                                                                                                                                                         'GOOD', '2026-04-14', NULL, 1, '2026-04-14 21:45:00', NULL),

                                                                                                                                                        (5, 'Kick-off ins neue Quartal',
                                                                                                                                                         'Q1-Rückblick fertig. 8 von geplanten 6 Büchern gelesen — Ziel übererfüllt. Laufen etabliert.',
                                                                                                                                                         'Payment-Implementierung weiter nach hinten verschoben als geplant.',
                                                                                                                                                         'Quarterly Reviews am Anfang des Monats machen, nicht in der Mitte.',
                                                                                                                                                         'Dass Q1 trotz allem ein guter Start war. Easy Life wächst.',
                                                                                                                                                         'GOOD', '2026-04-01', NULL, 1, '2026-04-01 20:30:00', NULL);

-- journal_categories
INSERT INTO journal_categories (journal_entry_id, category_id) VALUES
                                                                   (1, 1), (1, 6),
                                                                   (2, 4), (2, 3),
                                                                   (3, 3), (3, 5),
                                                                   (4, 1),
                                                                   (5, 1), (5, 3);

-- ============================================================
-- 11. CALENDAR EVENTS  (User 1: felix)
-- ============================================================
INSERT INTO calendar_events (id, title, description, location, event_color, event_type, recurrence, access_type, all_day, start_date_time, end_date_time, user_id, created_at, updated_at) VALUES
                                                                                                                                                                                               (1,  'Weekly Team Sync',
                                                                                                                                                                                                'Wöchentliches Entwickler-Meeting: Status, Blocker, Planung.',
                                                                                                                                                                                                'Google Meet', '#1976d2', 'APPOINTMENT', 'WEEKLY', 'PRIVATE', 0,
                                                                                                                                                                                                '2026-05-13 10:00:00', '2026-05-13 11:00:00', 1, '2026-01-01 08:00:00', NULL),

                                                                                                                                                                                               (2,  '10km Testlauf — Stadtpark',
                                                                                                                                                                                                'Erster offizieller Testlauf der Saison. Zielzeit: unter 52 Minuten.',
                                                                                                                                                                                                'Stadtpark Düsseldorf', '#43a047', 'TASK', 'NONE', 'PUBLIC', 0,
                                                                                                                                                                                                '2026-05-17 07:30:00', '2026-05-17 09:00:00', 1, '2026-05-01 10:00:00', NULL),

                                                                                                                                                                                               (3,  'Easy Life — Investor Call',
                                                                                                                                                                                                'Erstes Gespräch mit möglichem Angel-Investor. Pitch Deck vorbereiten.',
                                                                                                                                                                                                'Zoom', '#e91e63', 'APPOINTMENT', 'NONE', 'PRIVATE', 0,
                                                                                                                                                                                                '2026-05-20 15:00:00', '2026-05-20 16:00:00', 1, '2026-05-08 09:00:00', NULL),

                                                                                                                                                                                               (4,  'Davids Geburtstag 🎂',
                                                                                                                                                                                                NULL,
                                                                                                                                                                                                NULL, '#f57c00', 'BIRTHDAY', 'YEARLY', 'PRIVATE', 1,
                                                                                                                                                                                                '2026-05-23 00:00:00', '2026-05-23 23:59:00', 1, '2024-01-10 09:00:00', NULL),

                                                                                                                                                                                               (5,  'Stripe Integration Review',
                                                                                                                                                                                                'Code-Review der Payment-Implementation mit Jan.',
                                                                                                                                                                                                'Discord', '#9c27b0', 'APPOINTMENT', 'NONE', 'PRIVATE', 0,
                                                                                                                                                                                                '2026-05-26 14:00:00', '2026-05-26 15:30:00', 1, '2026-05-10 10:00:00', NULL),

                                                                                                                                                                                               (6,  'Monatlicher Budget-Check',
                                                                                                                                                                                                'Einnahmen, Ausgaben und Sparrate für Mai auswerten.',
                                                                                                                                                                                                NULL, '#f57c00', 'REMINDER', 'MONTHLY', 'PRIVATE', 0,
                                                                                                                                                                                                '2026-05-31 19:00:00', '2026-05-31 19:30:00', 1, '2026-01-01 08:00:00', NULL);

-- event_categories
INSERT INTO event_categories (event_id, category_id) VALUES
                                                         (1, 1),
                                                         (2, 4),
                                                         (3, 1), (3, 2),
                                                         (4, 3),
                                                         (5, 1),
                                                         (6, 2);

-- ============================================================
-- 12. DOCUMENTS  (User 1: felix)
-- ============================================================
INSERT INTO documents (id, title, description, file_path, file_type, file_size_bytes, access_type, user_id, uploaded_at, updated_at) VALUES
                                                                                                                                         (1, 'Easy Life — Pitch Deck',
                                                                                                                                          'Seed-Round Pitch Deck mit Vision, Markt, Produkt und Traction.',
                                                                                                                                          'docs/felix_mueller/pitch-deck-2026.pdf', 'pdf', 4200000,
                                                                                                                                          'PRIVATE', 1, '2026-04-15 10:00:00', NULL),

                                                                                                                                         (2, 'Backend Architektur',
                                                                                                                                          'Überblick über Modulstruktur, Datenbankdesign und API-Konzept.',
                                                                                                                                          'docs/felix_mueller/architecture-v2.pdf', 'pdf', 1800000,
                                                                                                                                          'PUBLIC', 1, '2026-03-20 14:00:00', NULL),

                                                                                                                                         (3, 'Budget & Finanzplan 2026',
                                                                                                                                          'Monatliches Budget-Tracking, Sparrate und Investitionsplan.',
                                                                                                                                          'docs/felix_mueller/budget-2026.xlsx', 'xlsx', 340000,
                                                                                                                                          'PRIVATE', 1, '2026-01-05 09:00:00', '2026-05-01 08:00:00'),

                                                                                                                                         (4, 'Leseliste 2026',
                                                                                                                                          'Alle 24 geplanten Bücher mit Notizen und Bewertungen.',
                                                                                                                                          'docs/felix_mueller/reading-list-2026.pdf', 'pdf', 520000,
                                                                                                                                          'PUBLIC', 1, '2026-01-01 20:00:00', '2026-04-01 19:00:00'),

                                                                                                                                         (5, 'API Dokumentation v1',
                                                                                                                                          'Vollständige REST API Referenz für alle Endpunkte.',
                                                                                                                                          'docs/felix_mueller/api-docs-v1.html', 'html', 890000,
                                                                                                                                          'PUBLIC', 1, '2026-03-22 11:00:00', '2026-05-10 09:00:00');

-- document_categories
INSERT INTO document_categories (document_id, category_id) VALUES
                                                               (1, 1), (1, 2),
                                                               (2, 1),
                                                               (3, 2),
                                                               (4, 5),
                                                               (5, 1);

-- ============================================================
-- 13. CONTACTS  (User 1: felix)
-- ============================================================
INSERT INTO contacts (id, firstname, lastname, company, position, email, phone, linkedin_url, website_url, notes, tags, relationship_type, last_contacted_at, user_id, created_at, updated_at) VALUES
                                                                                                                                                                                                   (1, 'David',  'Müller',    NULL,           'Co-Founder',             'david@easylife.app',    '+49 151 11111111', NULL,                               NULL,                  'Bruder & Co-Founder von Easy Life.', 'family,co-founder',  'FRIEND',    '2026-05-11', 1, '2024-01-10 09:00:00', NULL),
                                                                                                                                                                                                   (2, 'Anna',   'Bergmann',  'VC Capital',   'Investment Associate',   'anna.bergmann@vc.de',   '+49 160 22222222', 'linkedin.com/in/annabergmann',     NULL,                  'Erstes Gespräch sehr positiv. Follow-up in 2 Wochen.', 'investor,vc', 'BUSINESS',  '2026-05-08', 1, '2026-05-05 15:00:00', NULL),
                                                                                                                                                                                                   (3, 'Marcus', 'Klein',     'AWS',          'Solutions Architect',    'marcus.klein@aws.com',  NULL,               'linkedin.com/in/marcusklein',      NULL,                  'Hilft beim AWS-Setup und Architektur.', 'cloud,aws', 'COLLEAGUE', '2026-04-20', 1, '2026-03-10 10:00:00', NULL),
                                                                                                                                                                                                   (4, 'Sophia', 'Hartmann',  'Design Studio','UX Lead',                'sophia@design-studio.de','+49 176 33333333','linkedin.com/in/sophiahartmann',   'design-studio.de',    'Hat das ursprüngliche Easy Life UX Review gemacht.', 'design,ux', 'COLLEAGUE', '2026-03-15', 1, '2025-11-01 14:00:00', NULL),
                                                                                                                                                                                                   (5, 'Thomas', 'Richter',   'Steuerberater','Geschäftsführer',        'thomas@stb-richter.de', '+49 211 44444444', NULL,                               'stb-richter.de',      'Übernimmt Buchhaltung und Steuer ab Q3 2026.', 'tax,accounting', 'BUSINESS',  '2026-04-10', 1, '2026-02-15 11:00:00', NULL);

-- contact_categories
INSERT INTO contact_categories (contact_id, category_id) VALUES
                                                             (1, 1), (1, 3),
                                                             (2, 1), (2, 2),
                                                             (3, 1),
                                                             (4, 1),
                                                             (5, 2);

-- ============================================================
-- 14. CONTACT NOTES
-- ============================================================
INSERT INTO contact_notes (id, content, contact_id, created_at, updated_at) VALUES
                                                                                (1, 'Erstes Gespräch über Series-A Strategie — sehr konstruktiv. Sie interessiert sich besonders für die AI-Agent Differenzierung.', 2, '2026-05-08 17:00:00', NULL),
                                                                                (2, 'Follow-up für 22. Mai vereinbart. Pitch Deck vorher schicken.', 2, '2026-05-08 17:05:00', NULL),
                                                                                (3, 'AWS-Credits Programm für Startups angesprochen — wir sollten uns bewerben.', 3, '2026-04-20 11:00:00', NULL),
                                                                                (4, 'UX Review abgeschlossen. Hauptpunkte: Navigation vereinfachen, Onboarding-Flow verbessern.', 4, '2026-03-15 16:00:00', NULL),
                                                                                (5, 'Unterlagen für Steuererklärung 2025 bis 30. Juni einreichen.', 5, '2026-04-10 12:00:00', NULL);

-- ============================================================
-- 15. WEEK PLANS  (User 1: felix)
-- ============================================================
INSERT INTO week_plans (id, title, intention, reflection, status, start_date, end_date, user_id, created_at, updated_at) VALUES
                                                                                                                             (1, 'KW 20 — Frontend Integration',
                                                                                                                              'Diese Woche fokussiert an den Frontend Services arbeiten. Mock-Daten raus, echte API rein. Keine neuen Features anfangen.',
                                                                                                                              NULL,
                                                                                                                              'ACTIVE', '2026-05-11', '2026-05-17', 1, '2026-05-10 20:00:00', '2026-05-10 20:00:00'),

                                                                                                                             (2, 'KW 18 — Backend Finalisierung',
                                                                                                                              'Alle offenen Backend-Punkte abschließen: UserSearch, AI-Agent Stub, öffentliche Profile.',
                                                                                                                              'Gute Woche. UserSearch fertig, AI-Agent angefangen. Noch etwas mehr Puffer für Reviews einplanen.',
                                                                                                                              'COMPLETED', '2026-04-27', '2026-05-03', 1, '2026-04-26 21:00:00', '2026-05-04 10:00:00');

-- week_plan_categories
INSERT INTO week_plan_categories (week_plan_id, category_id) VALUES
                                                                 (1, 1), (1, 6),
                                                                 (2, 1);

-- ============================================================
-- 16. WEEK PLAN ITEMS
-- ============================================================
INSERT INTO week_plan_items (id, title, description, done, due_date, week_plan_id, created_at, updated_at) VALUES
-- KW 20 (week_plan_id=1)
(1,  'HTTP Services für Users + Auth',   'UserService, AuthService mit echten API-Calls', 0, '2026-05-13', 1, '2026-05-10 20:00:00', '2026-05-10 20:00:00'),
(2,  'HTTP Services für Goals + Todos',  'GoalService, TodoService fertigstellen',        0, '2026-05-13', 1, '2026-05-10 20:00:00', '2026-05-10 20:00:00'),
(3,  'HTTP Services für Journal',        'JournalService mit Pagination',                 0, '2026-05-14', 1, '2026-05-10 20:00:00', '2026-05-10 20:00:00'),
(4,  'HTTP Services für Calendar',       'CalendarService mit Range-Queries',             0, '2026-05-15', 1, '2026-05-10 20:00:00', '2026-05-10 20:00:00'),
(5,  'HTTP Services für Network',        'FollowService + UserSearch einbinden',          0, '2026-05-15', 1, '2026-05-10 20:00:00', '2026-05-10 20:00:00'),
(6,  'Laufen: 6km Intervall',            '3x 2km mit je 2 min Pause',                     1, '2026-05-12', 1, '2026-05-10 20:00:00', '2026-05-12 08:30:00'),
(7,  '"Deep Work" Kapitel 4–6 lesen',    NULL,                                             0, '2026-05-16', 1, '2026-05-10 20:00:00', '2026-05-10 20:00:00'),
-- KW 18 (week_plan_id=2)
(8,  'UserSearch Endpoint',              'Inkl. followStatus und Counts',                 1, '2026-04-28', 2, '2026-04-26 21:00:00', '2026-04-28 17:00:00'),
(9,  'Öffentliche Profile vorbereiten',  'Goal/Category API für Fremdprofile',            1, '2026-04-30', 2, '2026-04-26 21:00:00', '2026-04-30 15:00:00'),
(10, 'AI Agent Stub',                    'Controller + leerer Streaming-Endpoint',        1, '2026-05-02', 2, '2026-04-26 21:00:00', '2026-05-02 18:00:00'),
(11, 'Laufen: 5km Dauerlauf',            NULL,                                             1, '2026-04-29', 2, '2026-04-26 21:00:00', '2026-04-29 08:00:00');

-- ============================================================
-- 17. NOTIFICATIONS  (User 1: felix)
-- ============================================================
INSERT INTO notifications (id, title, message, type, channel, reference_type, reference_id, already_read, scheduled_at, sent_at, user_id, created_at, updated_at) VALUES
                                                                                                                                                                      (1, 'Jan möchte dir folgen',
                                                                                                                                                                       'jan_datadev hat eine Follow-Anfrage gesendet.',
                                                                                                                                                                       'INFO', 'IN_APP', NULL, NULL, 0,
                                                                                                                                                                       '2025-12-01 14:00:00', '2025-12-01 14:00:00', 1, '2025-12-01 14:00:00', NULL),

                                                                                                                                                                      (2, 'Ziel-Erinnerung: 10km Lauf',
                                                                                                                                                                       'Dein Testlauf ist in 5 Tagen. Bist du bereit?',
                                                                                                                                                                       'REMINDER', 'IN_APP', 'GOAL', 2, 0,
                                                                                                                                                                       '2026-05-12 09:00:00', '2026-05-12 09:00:00', 1, '2026-05-12 09:00:00', NULL),

                                                                                                                                                                      (3, 'KW 18 abgeschlossen 🎉',
                                                                                                                                                                       'Glückwunsch! Du hast 3 von 4 Wochenplan-Items erledigt.',
                                                                                                                                                                       'SUCCESS', 'IN_APP', 'GOAL', 2, 1,
                                                                                                                                                                       '2026-05-04 08:00:00', '2026-05-04 08:00:00', 1, '2026-05-04 08:00:00', '2026-05-04 09:00:00'),

                                                                                                                                                                      (4, 'Investor Call morgen',
                                                                                                                                                                       'Erinnerung: Easy Life Investor Call mit Anna Bergmann um 15:00 Uhr.',
                                                                                                                                                                       'REMINDER', 'IN_APP', 'EVENT', 3, 0,
                                                                                                                                                                       '2026-05-19 09:00:00', '2026-05-19 09:00:00', 1, '2026-05-12 10:00:00', NULL),

                                                                                                                                                                      (5, 'Sarah folgt dir jetzt',
                                                                                                                                                                       'sarah_creates folgt dir jetzt.',
                                                                                                                                                                       'INFO', 'IN_APP', NULL, NULL, 1,
                                                                                                                                                                       '2024-06-02 08:05:00', '2024-06-02 08:05:00', 1, '2024-06-02 08:05:00', '2024-06-02 10:00:00'),

                                                                                                                                                                      (6, 'Dokument öffentlich zugänglich',
                                                                                                                                                                       'Dein Dokument "Backend Architektur" ist jetzt öffentlich sichtbar.',
                                                                                                                                                                       'SUCCESS', 'IN_APP', 'DOCUMENT', 2, 1,
                                                                                                                                                                       '2026-03-20 14:05:00', '2026-03-20 14:05:00', 1, '2026-03-20 14:05:00', '2026-03-20 15:00:00');

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- Kurzübersicht der User-IDs für API-Calls:
--   felix_mueller  → id=1  (Hauptuser zum Testen)
--   sarah_creates  → id=2
--   jan_datadev    → id=3
--   lena_builds    → id=4
-- ============================================================