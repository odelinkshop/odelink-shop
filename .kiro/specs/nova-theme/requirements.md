# Requirements Document

## Introduction

Nova Theme Integration enables the deployment of a modern Next.js 16 e-commerce theme at demo.odelink.shop subdomain. The Nova theme serves as a premium demonstration template for Ödelink.shop platform, showcasing advanced features while maintaining complete isolation from the main application. This integration requires establishing a complete Next.js application structure, containerized deployment, and proxy-based routing without affecting existing Shopier integration or main site functionality.

## Glossary

- **Nova_Theme**: A Next.js 16.2.4 application serving as a premium e-commerce demonstration template
- **Main_Site**: The primary Ödelink.shop application running at www.odelink.shop
- **Backend_Service**: The Express.js Node.js 20 backend service managing API requests and serving the Main_Site
- **Nova_Container**: A Docker container running the Nova_Theme application independently
- **Proxy_Layer**: Backend routing mechanism that forwards demo.odelink.shop requests to Nova_Container
- **Docker_Compose_Stack**: The orchestrated set of containers (postgres, backend, nova) managed by docker-compose.yml
- **GitHub_Actions_Pipeline**: The CI/CD workflow that deploys code changes to VDS via SSH
- **VDS**: Virtual Dedicated Server hosting the production environment
- **Shopier_Integration**: Existing payment and product catalog integration that must remain untouched
- **Theme_Source_Code**: The complete Next.js application files including package.json, app/, components/, and configuration files

## Requirements

### Requirement 1: Nova Theme Application Structure

**User Story:** As a developer, I want a complete Next.js 16 application structure for Nova theme, so that I can build and deploy a functional e-commerce demonstration site.

#### Acceptance Criteria

1. THE Nova_Theme SHALL contain a valid package.json with Next.js 16.2.4, React 19.2.4, TypeScript 5, and Tailwind CSS dependencies
2. THE Nova_Theme SHALL include a Next.js app directory structure with layout.tsx, page.tsx, and error.tsx files
3. THE Nova_Theme SHALL include TypeScript configuration files (tsconfig.json, next-env.d.ts)
4. THE Nova_Theme SHALL include Tailwind CSS configuration (tailwind.config.ts, postcss.config.js)
5. THE Nova_Theme SHALL include a next.config.js with production-ready settings
6. WHEN the Nova_Theme is built, THE build process SHALL produce a .next directory with optimized static and server assets
7. THE Nova_Theme SHALL include a .gitignore file excluding node_modules, .next, and .env.local
8. THE Nova_Theme SHALL NOT include node_modules or .next directories in version control

### Requirement 2: Nova Theme Visual Design and Content

**User Story:** As a potential customer, I want to see a professional e-commerce theme demonstration, so that I can evaluate Ödelink.shop platform capabilities.

#### Acceptance Criteria

1. THE Nova_Theme SHALL display a modern, responsive homepage with hero section, product showcase, and call-to-action elements
2. THE Nova_Theme SHALL implement a consistent design system using Tailwind CSS utility classes
3. THE Nova_Theme SHALL include placeholder product cards with images, titles, prices, and "Add to Cart" buttons
4. THE Nova_Theme SHALL include a navigation header with logo, menu items, and shopping cart icon
5. THE Nova_Theme SHALL include a footer with company information, social links, and legal pages
6. WHEN viewed on mobile devices, THE Nova_Theme SHALL display a responsive layout optimized for screen sizes below 768px
7. THE Nova_Theme SHALL use Turkish language for all user-facing text and content
8. THE Nova_Theme SHALL include accessibility attributes (ARIA labels, alt text) for all interactive elements

### Requirement 3: Docker Container Configuration

**User Story:** As a DevOps engineer, I want Nova theme running in an isolated Docker container, so that it operates independently without affecting the main site.

#### Acceptance Criteria

1. THE Nova_Container SHALL use Node.js 20 Alpine base image for minimal footprint
2. THE Nova_Container SHALL expose port 3001 for HTTP traffic
3. THE Nova_Container SHALL include a Dockerfile in the Nova directory with multi-stage build optimization
4. WHEN the Nova_Container starts, THE container SHALL execute `npm run start` to serve the production build
5. THE Nova_Container SHALL include environment variables for NEXT_PUBLIC_API_URL and PORT
6. THE Nova_Container SHALL include a healthcheck endpoint responding at /api/health
7. THE Docker_Compose_Stack SHALL include a nova service definition with restart policy "unless-stopped"
8. THE Docker_Compose_Stack SHALL configure nova service to depend on backend service availability
9. THE Nova_Container SHALL mount a volume for persistent .env.local configuration
10. WHEN Docker_Compose_Stack starts, THE Nova_Container SHALL start after Backend_Service is healthy

### Requirement 4: Backend Proxy Routing

**User Story:** As a system architect, I want backend to proxy demo.odelink.shop requests to Nova container, so that users can access the theme via subdomain without exposing container ports.

#### Acceptance Criteria

1. WHEN a request arrives with Host header "demo.odelink.shop", THE Backend_Service SHALL proxy the request to Nova_Container at http://nova:3001
2. THE Backend_Service SHALL preserve original request headers (X-Forwarded-For, X-Real-IP, X-Forwarded-Proto) when proxying
3. THE Backend_Service SHALL handle WebSocket upgrade requests for Nova_Theme hot reload in development
4. WHEN Nova_Container is unavailable, THE Backend_Service SHALL return HTTP 503 Service Unavailable with descriptive error message
5. THE Backend_Service SHALL NOT proxy requests for www.odelink.shop or odelink.shop to Nova_Container
6. THE Backend_Service SHALL log all proxy requests to Nova_Container with timestamp and response status
7. THE Backend_Service SHALL set proxy timeout to 30 seconds for Nova_Container requests
8. WHEN proxying static assets, THE Backend_Service SHALL preserve Cache-Control headers from Nova_Container

### Requirement 5: GitHub Actions Deployment Pipeline

**User Story:** As a developer, I want automated deployment of Nova theme changes, so that updates are deployed to production without manual intervention.

#### Acceptance Criteria

1. WHEN code is pushed to main branch, THE GitHub_Actions_Pipeline SHALL trigger deployment workflow
2. THE GitHub_Actions_Pipeline SHALL SSH into VDS and pull latest code from GitHub repository
3. THE GitHub_Actions_Pipeline SHALL create backend/.env file with production environment variables including NOVA_ENABLED=true
4. THE GitHub_Actions_Pipeline SHALL execute `docker compose down` to stop existing containers
5. THE GitHub_Actions_Pipeline SHALL execute `docker compose up -d --build` to rebuild and start all containers
6. THE GitHub_Actions_Pipeline SHALL verify Nova_Container health after deployment
7. WHEN deployment fails, THE GitHub_Actions_Pipeline SHALL preserve previous container state and report error
8. THE GitHub_Actions_Pipeline SHALL prune unused Docker images after successful deployment
9. THE GitHub_Actions_Pipeline SHALL complete deployment within 10 minutes timeout
10. THE GitHub_Actions_Pipeline SHALL NOT modify Shopier_Integration configuration or credentials

### Requirement 6: Environment Configuration Management

**User Story:** As a system administrator, I want separate environment configurations for Nova theme, so that development and production settings are properly isolated.

#### Acceptance Criteria

1. THE Nova_Theme SHALL read NEXT_PUBLIC_API_URL from environment variables for backend API endpoint
2. THE Nova_Theme SHALL read PORT from environment variables with default value 3001
3. THE Nova_Theme SHALL read NODE_ENV from environment variables to determine build mode
4. THE Nova_Theme SHALL include a .env.example file documenting all required environment variables
5. WHEN NODE_ENV is "production", THE Nova_Theme SHALL disable React development warnings and enable optimizations
6. THE Backend_Service SHALL read NOVA_ENABLED environment variable to enable or disable proxy routing
7. THE Backend_Service SHALL read NOVA_CONTAINER_URL environment variable with default "http://nova:3001"
8. WHEN NOVA_ENABLED is "false", THE Backend_Service SHALL return HTTP 404 for demo.odelink.shop requests
9. THE VDS SHALL store production environment variables in backend/.env file created by GitHub_Actions_Pipeline
10. THE Nova_Theme SHALL NOT expose sensitive backend credentials in client-side environment variables

### Requirement 7: Nginx Reverse Proxy Configuration

**User Story:** As a network administrator, I want Nginx to route demo.odelink.shop traffic to backend, so that SSL termination and security headers are consistently applied.

#### Acceptance Criteria

1. THE Nginx configuration SHALL include a server block for demo.odelink.shop subdomain
2. WHEN a request arrives for demo.odelink.shop, THE Nginx SHALL proxy to Backend_Service at http://127.0.0.1:5000
3. THE Nginx SHALL apply SSL certificates for demo.odelink.shop using Let's Encrypt or Cloudflare Origin Certificate
4. THE Nginx SHALL set security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection) for demo.odelink.shop
5. THE Nginx SHALL configure Cloudflare real IP detection for demo.odelink.shop requests
6. THE Nginx SHALL set client_max_body_size to 50M for demo.odelink.shop uploads
7. THE Nginx SHALL log demo.odelink.shop access and errors to separate log files
8. WHEN demo.odelink.shop receives HTTP request, THE Nginx SHALL redirect to HTTPS with 301 status code
9. THE Nginx SHALL set proxy timeouts (connect: 60s, send: 60s, read: 60s) for demo.odelink.shop
10. THE Nginx configuration SHALL NOT modify existing www.odelink.shop server block settings

### Requirement 8: Database Independence and Isolation

**User Story:** As a database administrator, I want Nova theme to operate without database dependencies, so that it remains a stateless demonstration application.

#### Acceptance Criteria

1. THE Nova_Theme SHALL NOT establish direct connections to PostgreSQL database
2. THE Nova_Theme SHALL use mock data or static JSON files for product demonstrations
3. THE Nova_Theme SHALL NOT require database migrations or schema changes
4. WHEN Nova_Theme needs dynamic data, THE Nova_Theme SHALL fetch from Backend_Service API endpoints
5. THE Nova_Container SHALL NOT include PostgreSQL client libraries or connection strings
6. THE Docker_Compose_Stack SHALL NOT configure database environment variables for Nova_Container
7. THE Nova_Theme SHALL function correctly without postgres service running
8. THE Nova_Theme SHALL NOT modify or access Main_Site user data or sessions

### Requirement 9: Shopier Integration Preservation

**User Story:** As a business owner, I want Shopier payment integration to remain fully functional, so that existing customer transactions are not disrupted.

#### Acceptance Criteria

1. THE Nova_Theme deployment SHALL NOT modify backend/services/shopierApiService.js
2. THE Nova_Theme deployment SHALL NOT modify backend/services/shopierSyncService.js
3. THE Nova_Theme deployment SHALL NOT modify backend/services/shopierCatalogService.js
4. THE Nova_Theme deployment SHALL NOT modify backend/routes/shopier.js
5. THE Nova_Theme deployment SHALL NOT modify backend/routes/real-shopier.js
6. THE GitHub_Actions_Pipeline SHALL NOT change SHOPIER_API_TOKEN environment variable
7. WHEN Nova_Theme is deployed, THE Backend_Service SHALL continue processing Shopier webhook callbacks
8. WHEN Nova_Theme is deployed, THE Main_Site SHALL continue displaying Shopier product catalogs
9. THE Nova_Theme SHALL NOT intercept or modify requests to /api/shopier/* endpoints
10. THE Nova_Theme deployment SHALL NOT restart Backend_Service unless Docker_Compose_Stack requires it

### Requirement 10: Health Monitoring and Error Recovery

**User Story:** As a site reliability engineer, I want automated health checks and recovery mechanisms, so that Nova theme remains available without manual intervention.

#### Acceptance Criteria

1. THE Nova_Container SHALL implement a /api/health endpoint returning JSON with status "ok" and timestamp
2. THE Docker_Compose_Stack SHALL configure healthcheck for Nova_Container with 30-second interval
3. WHEN Nova_Container healthcheck fails 3 consecutive times, THE Docker_Compose_Stack SHALL restart Nova_Container
4. THE Backend_Service SHALL implement a /api/nova/status endpoint checking Nova_Container availability
5. WHEN Backend_Service cannot reach Nova_Container, THE Backend_Service SHALL log error and return cached error page
6. THE Nova_Container SHALL include restart policy "unless-stopped" in docker-compose.yml
7. WHEN Nova_Container crashes, THE Docker_Compose_Stack SHALL automatically restart the container within 10 seconds
8. THE GitHub_Actions_Pipeline SHALL verify Nova_Container health before marking deployment as successful
9. WHEN deployment health check fails, THE GitHub_Actions_Pipeline SHALL rollback to previous container version
10. THE Backend_Service SHALL expose Nova_Container health status in /api/metrics endpoint for monitoring

### Requirement 11: Performance Optimization

**User Story:** As a performance engineer, I want Nova theme to load quickly and efficiently, so that demonstration visitors have a positive experience.

#### Acceptance Criteria

1. THE Nova_Theme SHALL implement Next.js Image component for automatic image optimization
2. THE Nova_Theme SHALL enable static generation for all pages that do not require runtime data
3. THE Nova_Theme SHALL implement code splitting for client-side JavaScript bundles
4. WHEN Nova_Theme is built, THE build process SHALL generate optimized CSS with unused styles removed
5. THE Nova_Theme SHALL implement lazy loading for below-the-fold images and components
6. THE Nova_Theme SHALL achieve Lighthouse performance score above 90 on desktop
7. THE Nova_Theme SHALL achieve Lighthouse performance score above 80 on mobile
8. THE Nova_Theme SHALL implement HTTP/2 server push for critical CSS and JavaScript
9. THE Nova_Container SHALL enable gzip compression for text-based responses
10. THE Nova_Theme SHALL implement service worker for offline functionality and asset caching

### Requirement 12: Development Workflow and Documentation

**User Story:** As a developer, I want clear documentation and development commands, so that I can efficiently work on Nova theme locally.

#### Acceptance Criteria

1. THE Nova_Theme SHALL include a README.md with setup instructions, development commands, and deployment process
2. THE Nova_Theme SHALL include npm scripts for "dev" (development server), "build" (production build), "start" (production server), and "lint" (code quality)
3. THE Nova_Theme SHALL include ESLint configuration with Next.js recommended rules
4. THE Nova_Theme SHALL include Prettier configuration for consistent code formatting
5. WHEN developer runs `npm run dev`, THE Nova_Theme SHALL start development server on port 3001 with hot reload
6. WHEN developer runs `npm run build`, THE Nova_Theme SHALL produce production-optimized build in .next directory
7. THE Nova_Theme SHALL include TypeScript strict mode enabled in tsconfig.json
8. THE Nova_Theme SHALL include a CONTRIBUTING.md file with coding standards and pull request guidelines
9. THE Nova_Theme SHALL include a .editorconfig file for consistent editor settings
10. THE documentation SHALL include troubleshooting section for common deployment and runtime errors
