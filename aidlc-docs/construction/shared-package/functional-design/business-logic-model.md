# Business Logic Model — Unit 1: Shared Package

## Overview
Unit 1 (Shared Package) contains no business logic — it is purely type definitions, interfaces, and constants. Business logic resides in the service units (2, 3, 4).

## Package Responsibilities
1. Define all TypeScript interfaces and types used across services
2. Define all enums and constants (statuses, roles, types)
3. Define API request/response contracts
4. Define shared validation constants (file size limits, allowed types)

## No Business Rules
This unit has no business rules, algorithms, or decision logic. It serves as the contract layer that all other units import.

## Build Configuration
- Compiled TypeScript package
- Exports all types via barrel file (index.ts)
- No runtime dependencies
- Used as a workspace dependency by all services and frontend
