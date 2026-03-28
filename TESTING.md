# Portfolio Testing Suite

## Setup (una sola vez)

```bash
cd C:\Users\PPC\Downloads\test
npm install
```

## Correr las pruebas

### 1. Validar el JSON (schema + contenido)
```bash
npm run test:schema
```
Verifica que config.json tenga la estructura correcta, que todos los roles existan,
que no haya IDs duplicados, y que las rutas de imagenes existan.

### 2. Pruebas unitarias (funciones JS)
```bash
npm run test:unit
```
Testea getImages(), getRoleLabel(), getRoleColor(), hexToRgba() y consistencia del config.

### 3. Pruebas E2E (interfaz completa)
Primero levanta el servidor en una terminal:
```bash
npm start
```

En otra terminal, corre las pruebas:
```bash
npm run test:e2e
```

O para verlas en el navegador interactivamente:
```bash
npm run test:e2e:open
```

### 4. Correr todo junto
```bash
npm start
# En otra terminal:
npm run test:all
```

## Que testea cada archivo

| Archivo | Que prueba |
|---------|-----------|
| tests/schema.test.js | Estructura del JSON, roles validos, imagenes existentes |
| tests/unit.test.js | Funciones JS puras, consistencia de datos |
| tests/e2e/portfolio.cy.js | Navegacion, filtros, flip cards, lightbox, responsive |

## Agregar pruebas nuevas

- Para validar un campo nuevo en el JSON: edita `tests/schema.test.js`
- Para testear una funcion nueva: edita `tests/unit.test.js`
- Para testear una interaccion nueva: agrega un `it()` en `tests/e2e/portfolio.cy.js`
