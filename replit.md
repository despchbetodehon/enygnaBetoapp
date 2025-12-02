# Overview

This is a Next.js-based web application for "Despachante Beto Dehon," a vehicle documentation and registration service business in Brazil. The application provides a comprehensive platform for managing vehicle transfers, documentation services, client communications, and business operations. It features multi-user role-based access control, real-time chat functionality, AI-powered chatbots, financial management, and integration with various third-party services for vehicle data and WhatsApp communications.

The system serves three main user areas: client portal, business/enterprise management, and internal collaboration tools for staff members.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework**: Next.js (React-based) with TypeScript and SSR/SSG capabilities

**Rationale**: Next.js provides server-side rendering for better SEO and initial load performance, which is critical for a service-oriented business website. TypeScript adds type safety to reduce runtime errors.

**UI Component Libraries**:
- Material-UI v4 (@material-ui/core) - Primary component library
- Ant Design (antd) - Secondary component system
- Mantine (@mantine/core, @mantine/hooks, @mantine/dates) - Additional UI components
- Emotion for CSS-in-JS styling
- Tailwind CSS for utility-first styling

**Rationale**: Multiple UI libraries provide flexibility and comprehensive component coverage. Material-UI serves as the primary design system for consistency, while other libraries fill specific feature gaps. This creates technical debt but offers rapid development capabilities.

**State Management**: React Context API (AutenticacaoContext for authentication state)

**Rationale**: Context API is sufficient for the application's state management needs without adding complexity of external state management libraries like Redux. Authentication state is centralized and accessible throughout the component tree.

**Animation**: Framer Motion

**Rationale**: Provides smooth, performant animations for enhanced user experience, particularly important for a customer-facing service business.

**Mobile Support**: Capacitor for iOS and Android native capabilities

**Rationale**: Allows the web application to be packaged as a mobile app, extending reach to mobile users without maintaining separate native codebases.

## Backend Architecture

**Database**: Firebase Firestore (NoSQL document database)

**Rationale**: Firestore provides real-time data synchronization, which is essential for the chat functionality and collaborative features. It scales automatically and requires minimal backend infrastructure management.

**Authentication**: Firebase Authentication with custom email/password implementation

**Rationale**: Firebase Auth integrates seamlessly with Firestore and provides secure authentication with minimal configuration. Custom email/password allows direct user management in Firestore.

**File Storage**: Firebase Storage

**Rationale**: Integrated with Firebase ecosystem for storing user uploads, chat attachments, and document files. Provides secure access control and CDN delivery.

**API Routes**: Next.js API routes (server-side endpoints)

**Rationale**: Next.js API routes provide serverless functions for backend logic without requiring a separate server infrastructure. Simplifies deployment and scaling.

**Data Layer Pattern**: Custom `Colecao` (Collection) class wrapping Firestore operations

**Rationale**: Abstracts Firestore CRUD operations into reusable methods, providing a consistent data access layer throughout the application.

## Permission System Architecture

**Model**: Role-based access control (RBAC) with three distinct areas (cliente, empresarial, colaborador)

**Implementation**: 
- `PermissionManager` singleton class managing permission logic
- `usePermissions` custom hook for component-level access checks
- `ProtectedRoute` component for route-level protection
- Permission profiles stored in Firestore with module-level granularity

**Rationale**: Granular permissions allow fine-tuned access control across different user types (clients, business users, collaborators, administrators). The three-area model separates concerns between customer-facing, internal business, and staff collaboration features.

**Module Permissions**: Each area has modules (dashboard, chat, CRM, IA, feed, usuarios, whatsapp, relatorios, configuracoes, permissoes, financeiro, servicos, atendimento, documentos) with CRUD permissions (visualizar, criar, editar, excluir)

**Rationale**: Module-level permissions provide flexibility to grant or restrict access to specific features without creating numerous role variations.

## AI Integration Architecture

**Google Gemini AI**: Integrated via `@google/generative-ai` package

**Usage**: Powers chatbot responses for customer service automation

**Rationale**: Gemini provides natural language understanding for automated customer support, reducing manual workload for common inquiries about vehicle documentation services.

**Implementation**: ChatBot and ChatInterno components utilize Gemini for conversational AI

## Data Visualization Architecture

**Libraries**: 
- Chart.js for standard charts
- D3.js (with d3-geo) for geospatial visualizations
- Leaflet (implicit from type definitions) for interactive maps

**Rationale**: Multiple visualization libraries address different needs - Chart.js for business metrics, D3 for custom geographic visualizations of service areas in Santa Catarina, and Leaflet for interactive mapping features.

**Components**: MapaSantaCatarina, MapaD3GeoJSON, MapaLeaflet provide different mapping approaches

**Alternatives Considered**: Mapbox was considered (types imported) but not fully implemented

## Styling Architecture

**Approach**: Hybrid styling system combining:
- Tailwind CSS utility classes
- Material-UI makeStyles (JSS)
- Emotion styled components
- Global CSS

**Rationale**: This hybrid approach provides flexibility for different styling needs. Tailwind offers rapid prototyping, Material-UI ensures consistency, and Emotion allows component-scoped styles. However, this creates maintenance complexity.

**Theme**: Custom Material-UI theme with corporate color palette (green tones: #2d5a3d primary, #5d8f6c secondary)

**Rationale**: Professional color scheme aligned with brand identity for a service business. Typography uses serif fonts (Playfair Display, Georgia) for a luxurious, professional appearance.

## Security Architecture

**Headers**: Security headers configured in next.config.js and middleware.ts
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

**Rationale**: Prevents clickjacking, MIME-type sniffing, and limits referrer information leakage.

**CORS**: Configured for API routes to allow cross-origin requests

**Authentication Flow**: 
1. User credentials validated against Firestore usuarios collection
2. Session maintained via Context API
3. Protected routes check authentication state before rendering

**Data Access Control**: Firebase Security Rules (not visible in codebase but implied by architecture)

# External Dependencies

## Firebase Services
- **Firebase v9**: Core Firebase SDK
- **Firestore**: NoSQL database for user data, chat messages, service records, financial transactions
- **Firebase Authentication**: User authentication and session management
- **Firebase Storage**: File uploads and document storage
- **firebase-admin**: Server-side Firebase operations

## AI & Automation Services
- **Google Gemini AI** (`@google/generative-ai`): Natural language processing for chatbot functionality
- **WhatsApp Automation** (`@open-wa/wa-automate`): WhatsApp Business API integration for customer communications

## Third-Party APIs (Environment Variables Required)
- **BLUDATA_API_KEY**: Vehicle data lookup service
- **CNPJA_API_TOKEN**: Brazilian company (CNPJ) data verification
- **APICPF_TOKEN**: Brazilian CPF (individual taxpayer ID) validation
- **NEXT_PUBLIC_DIGISAC_TOKEN**: Customer service platform integration
- **GEMINI_API_KEY**: Google Gemini AI access

**Rationale**: These APIs provide essential business functionality for vehicle documentation services, including vehicle history checks, identity verification, and customer communication channels.

## UI & Visualization Libraries
- **Material-UI v4**: Primary component library with theming
- **Ant Design**: Supplementary UI components
- **Mantine**: Additional form and date components
- **Chart.js**: Business metrics visualization
- **D3.js**: Custom data visualizations and geographic mapping
- **Framer Motion**: Animation library
- **React Markdown**: Markdown rendering for chat messages

## Utility Libraries
- **axios**: HTTP client for API requests
- **date-fns**: Date manipulation and formatting
- **dayjs**: Lightweight date library
- **file-saver**: Client-side file downloads
- **lodash**: Utility functions (debounce referenced in codebase)

## Development & Build Tools
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS
- **PostCSS & Autoprefixer**: CSS processing
- **Capacitor**: Mobile app packaging for iOS/Android

## Deployment Platform
- **Vercel**: Implied by vercel.json configuration

**Rationale**: Vercel provides seamless Next.js deployment with automatic SSL, CDN, and serverless function support.

## Notable Architecture Decisions

**Multiple UI Libraries**: Trade-off between development speed and long-term maintainability. Provides comprehensive component coverage but increases bundle size and learning curve.

**Firebase-Only Backend**: Eliminates need for traditional server infrastructure but creates vendor lock-in. Suitable for real-time features and rapid development.

**Hybrid Styling**: Offers maximum flexibility but requires discipline to maintain consistency. Team should standardize on preferred approach for new development.

**Permission Complexity**: Three-area system with module-level permissions provides extensive control but adds complexity to UI logic and testing requirements.

**Mobile-First PWA with Native Capabilities**: Progressive Web App foundation with Capacitor wrapper allows single codebase for web and mobile while maintaining native features.