---
name: debugging-and-error-recovery
description: Protocolo metódico para el diagnóstico de causa raíz y recuperación ante errores. Úsalo cuando fallen builds, se rompan pruebas, ocurran excepciones no controladas o el comportamiento del software no coincida con lo esperado. Enfoque riguroso: Reproducir -> Aislar -> Corregir -> Proteger.
---

# Depuración y Recuperación de Errores (Debugging & Error Recovery)

## Visión General

Depurar no es cambiar código al azar hasta que el error desaparezca. El "parche ciego" a menudo oculta la causa raíz y genera regresiones peores en otros módulos.

Este estándar establece el método científico de 4 pasos para resolver problemas:
1. **Reproducir**: Confirmar el error de forma consistente con pasos exactos.
2. **Aislar**: Reducir el espacio del problema hasta identificar la línea o estado culpable.
3. **Corregir**: Aplicar la solución más simple y directa a la causa raíz.
4. **Proteger**: Blindar el sistema con una prueba o aserción para que el error nunca vuelva a repetirse.

## Protocolo de Diagnóstico

- **Examinar el Stack Trace Completo**: Leer de abajo hacia arriba para identificar el origen exacto en nuestro código antes de culpar a librerías externas.
- **Diferenciar Síntoma de Causa**: Un error de `undefined is not an object` en la UI suele ser síntoma de una Server Action que retornó un payload incompleto o una relación SQL faltante.
- **Verificar Supuestos**: Comprobar variables de entorno, puertos de conexión a PostgreSQL y cookies de sesión antes de refactorizar lógica.\n