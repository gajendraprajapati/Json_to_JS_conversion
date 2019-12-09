# BREX  POC 
- Documents:-
    
    refer ../documents

- Objectives of This POC:-
    
    refer documnet ../documents/poc features.xmind

- SETUP:- 

      npm install
      npm install gulp -g
      npm install typescript -g

- vs code setup automated ts to js conversion in vs code

      1. CTRL + SHIT + B
      2. Select tsc: watch - tsconfig.json from dropdown

- RUN:- 

      gulp compile-ts
      node .\src\generatePolicy.js     
- TEST:-

      npm run test