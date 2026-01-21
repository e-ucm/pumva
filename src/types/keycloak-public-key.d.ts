declare module 'keycloak-public-key' {
  class KeyCloakCerts {
    constructor(url: string, realm: string);
    fetch(kid: string): Promise<string>;
  }
  
  export = KeyCloakCerts;
}