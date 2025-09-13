# SIMULADOR DEL PROTOCOLO BB84 - APP

*Interactive Quantum Communication Frontend*

![Last Commit](https://img.shields.io/github/last-commit/JoaquinGaldame/PROTOCOLOBB84-app?style=flat&color=blue)
![Angular](https://img.shields.io/badge/Angular-20-DD0031?style=flat&logo=angular&logoColor=white)
![Languages](https://img.shields.io/badge/languages-TypeScript-blue)

---

### Built with the tools and technologies:

![Angular](https://img.shields.io/badge/Angular-20-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![PrimeNG](https://img.shields.io/badge/PrimeNG-009688?style=for-the-badge&logo=prime&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)


This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.1.5.

---

## Overview

Este proyecto es el **frontend** de la simulación del **Protocolo BB84**.  
Fue desarrollado en **Angular 20** y combina **PrimeNG** (para componentes UI) con **Tailwind CSS** (para estilos rápidos y personalizables).  

El objetivo es ofrecer una **interfaz interactiva** que permita visualizar la simulación del protocolo cuántico BB84, conectándose con la API backend (`PROTOCOLOBB84-API`).  
Los usuarios pueden:  
- Ejecutar simulaciones con o sin espía.  
- Visualizar los resultados (bases, bits, claves compartidas y porcentaje de coincidencia).  
- Navegar mediante un sistema de enrutamiento definido en Angular (detalles en [Routing](#routing)).  

---

##  Getting Started

###  Prerequisites

- Node.js 18+  
- Angular CLI 20+  
- npm o yarn  

###  Installation

Clonar el repositorio e instalar dependencias:

```bash
git clone https://github.com/USER/PROTOCOLOBB84-app.git
cd PROTOCOLOBB84-app

npm install
```

## Usage

### Development server
To start a local development server, run:

```bash
ng serve
```

By default it will be available in:
👉 http://localhost:4200


Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

### Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

### Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

### Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

### Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

### Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.


## Routing

Rutas definidas en este proyecto:

/ → Página principal

/bb84-simulator → Vista de simulación BB84

/about → Información del proyecto

