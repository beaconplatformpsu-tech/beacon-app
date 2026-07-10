# Project Design Guidelines

The following principles must be strictly implemented and adhered to during all development in this project. They guide architectural decisions, code refactoring, and feature additions.

## 1. The Essence of Good Design (ETC)
Good Design is easier to change than Bad Design. Thus, we believe in the ETC principle: **"Easier To Change"**.
ETC is a Value, not a Rule. It is a guide to help you make decisions. Always ask yourself during development: *"Is it easier or harder to change?"*

**Validation methods:**
- Try to make what you write replaceable, to make sure it won't become a roadblock in the future.
- Note the situation and choice you made, to reflect back on when you need to revisit the code.

## 2. DRY - The Evils of Duplication
Maintenance is a routine part of the entire development process. To develop reliable software that is easier to understand and maintain, follow the **DRY principle**:
*Every piece of knowledge must have a single, unambiguous, authoritative representation within a system.*

**Key aspects:**
- **DRY is More Than Code:** It is about the duplication of knowledge or intent. When a part of the code logic needs to change, and the changes apply to different places, the code is not DRY.
- **Duplication in Code:** If two functions do similar things but each has a different intent or purpose, they are still DRY.
- **Duplication in Documentation:** A comment explaining how a function works is a duplication of the code. The function name should describe what it does, and the details should remain in the source code.
- **DRY Violations in Data:** Use accessor functions to read/write attributes of objects to decouple the data structure from the implementation module.
- **Representational Duplication:** Standardize and document APIs to mitigate duplication across interfaces.
- **Interdeveloper Duplication:** Encourage active communication and make code easy to reuse to avoid risking duplicated knowledge.

## 3. Orthogonality
Orthogonality signifies independence or decoupling. Two or more things are orthogonal if changes in one do not affect any of the others.

**Benefits:**
- **Gain Productivity:** Reduce development and testing time since changes are localized, promote reusability, and composability.
- **Reduce Risk:** Code is isolated. Changes or bugs only affect a specific area.

**Techniques to maintain orthogonality:**
- Keep your code decoupled.
- Avoid global data.
- Avoid similar functions.
- Write unit tests to validate what it takes to build and run the module independently.

## 4. Reversibility
Assume no decision is final and prepare for uncertainties.
- Make your code easy to change.
- Build abstraction layers.
- Break your code into focused components.
