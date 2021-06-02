# Installing and running
To install dependencies from the command line run `npm i`
To run, from command line run `npm run dev`

To get package dependencies navigate to `http://localhost:3000/packages/<packagename>/<version>/dependencies`. Example: http://localhost:3000/packages/jws/4.0.0/dependencies

> Note: I have used the `typescript-express-starter` to seed this product. This has allowed me to focus on the main logic. I do not endorse the structure this starter site has. I have not removed the existing code and just added bits that I required for the new endpoint.

The relevant code is in `src/dependency-builder` folder. Few infrastructure pieces for `express` are there in `controllers` and `routes` folder. 


# Implementation notes
- Most of the heavy lifting here is done in `dependency-builder.ts` method `buildDependencyGraph`. It uses breath first tree traversal and tracks visited notes to avoid cycles.
- This implementation currently lacks validation on input fields. This can be done with the validation middleware we have
- The implementation only lists `dependencies`. I ignore `devDependencies` and `peerDependencies`.
- The dependency graph contains a dependency only once (name + version) even if it has been used multiple times. Hence this dependency graph is not a true representation of nested dependencies. Instead this is above direct/indirect dependencies for the main package we are probing.
- While I have added some tests, this needs some exhaustive testing and is missing integration and e2e tests.
    - I may have missed testing some type type of dependency hierarchy.
- I use `semver` library to do dependency version resolution but have not tests all types of resolution. I am not sure if this solution works for `git` based or `file` dependency.
- Improvements can also be made from a performance perspective
    - Current I have added rudimentary in-memory cache adapter for axios to cache npm registry responses (1 hour expiry)
        - While we can look at storing this in a data store, a hybrid approach  can be to store data in store and a *LRU cache* to cache popular stuff in memory.
    - Currently the final calculated graph is not cached but it can be cached at `express` level. This will require us to define the cache eviction policy as underlying packages change.

- From scaling perspective
  - The dependency graph is a good candidate for caching. We just need to determine the correct cache duration.
  - To effectively scale the applications servers, we can use external cache solutions like Redis to cache npm registry responses as well as our API responses. Again doing some LRU implementation if we need to manage costs. 
  - Datastore can be blob or a key/value pair store.