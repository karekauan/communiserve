# Casos de Uso

## Cadastrar Usuário (Administrador)

**Descrição:** O administrador cadastra um novo usuário no sistema, fornecendo informações como nome, email e papel/role do usuário.

**Atores:** Administrador

**Fluxo principal:**
1. O administrador inicia o processo de cadastro de um novo usuário.
2. O sistema solicita ao administrador as informações necessárias para o cadastro, como nome, email e papel/role do usuário.
3. O administrador fornece as informações solicitadas.
4. O sistema valida as informações e registra o novo usuário no sistema.

## Registrar Recurso (Usuário)

**Descrição:** O usuário registra um novo recurso no sistema, fornecendo informações como nome, descrição e permissões de acesso.

**Atores:** Usuário

**Fluxo principal:**
1. O usuário inicia o processo de registro de um novo recurso.
2. O sistema solicita ao usuário as informações necessárias para o registro do recurso, como nome, descrição e permissões de acesso.
3. O usuário fornece as informações solicitadas.
4. O sistema valida as informações e registra o novo recurso no sistema.

## Editar Recurso (Usuário)

**Descrição:** O usuário edita as informações de um recurso existente, como nome e descrição.

**Atores:** Usuário

**Fluxo principal:**
1. O usuário seleciona o recurso que deseja editar.
2. O sistema exibe as informações atuais do recurso.
3. O usuário modifica as informações desejadas, como nome e descrição do recurso.
4. O sistema valida as alterações e atualiza as informações do recurso no sistema.

## Gerenciar Conta (Usuário)

**Descrição:** O usuário gerencia sua própria conta, podendo atualizar suas informações pessoais, como nome, email e senha.

**Atores:** Usuário

**Fluxo principal:**
1. O usuário acessa a opção de gerenciar sua conta.
2. O sistema exibe as informações atuais da conta do usuário.
3. O usuário seleciona as informações que deseja atualizar, como nome, email ou senha.
4. O usuário fornece as novas informações desejadas.
5. O sistema valida as alterações e atualiza as informações da conta do usuário no sistema.

## Realizar Login (Usuário)

**Descrição:** O usuário realiza o login no sistema usando suas credenciais locais (nome de usuário e senha).

**Atores:** Usuário, Microsserviço de autenticação

**Fluxo principal:**
1. O usuário acessa a página de login do sistema.
2. O sistema solicita ao usuário que forneça seu nome de usuário e senha.
3. O usuário insere seu nome de usuário e senha.
4. O microsserviço de autenticação valida as credenciais fornecidas pelo usuário.
5. O sistema autentica o usuário e concede acesso ao sistema.

## Realizar Login por SSO (Usuário)

**Descrição:** O usuário realiza o login no sistema usando um provedor de Single Sign-On (SSO), como Google, Facebook, etc.

**Atores:** Usuário, Provedor de SSO, Microsserviço de autenticação

**Fluxo principal:**
1. O usuário seleciona a opção de login por SSO.
2. O sistema redireciona o usuário para a página de login do provedor de SSO selecionado.
3. O usuário insere suas credenciais de login no provedor de SSO.
4. O provedor de SSO autentica o usuário.
5. O microsserviço de autenticação recebe a confirmação de autenticação do provedor de SSO e concede acesso ao usuário no sistema.

## Acessar Recurso (Usuário)

**Descrição:** O usuário acessa um recurso específico no sistema, verificando se possui as permissões adequadas.

**Atores:** Usuário

**Fluxo principal:**
1. O usuário seleciona o recurso que deseja acessar.
2. O sistema verifica as permissões do usuário para o recurso.
3. Se o usuário possuir as permissões adequadas, o sistema permite o acesso ao recurso.
4. Caso contrário, o sistema nega o acesso ao recurso.

## Verificar Permissão de Acesso

**Descrição:** (Subcaso de uso incluído por Acessar Recurso e Editar Permissão em Recurso)

**Atores:** Microsserviço de autenticação

**Fluxo principal:**
1. O microsserviço de autenticação recebe uma solicitação para verificar a permissão de acesso a um recurso.
2. O microsserviço de autenticação verifica as permissões do usuário para o recurso em questão.
3. O microsserviço de autenticação retorna o resultado da verificação de permissão (permissão concedida ou negada).

## Negar Ação por Acesso Insuficiente

**Descrição:** (Subcaso de uso estendido por Verificar Permissão de Acesso)

**Atores:** Microsserviço de autenticação

**Fluxo principal:**
1. O microsserviço de autenticação recebe uma confirmação de que a permissão de acesso foi negada para uma ação solicitada pelo usuário.
2. O sistema exibe uma mensagem informando ao usuário que a ação foi negada devido a permissões insuficientes.

![Use Cases Diagram](https://raw.githubusercontent.com/karekauan/communiserve/master/acl/docs/use-cases.jpeg)
