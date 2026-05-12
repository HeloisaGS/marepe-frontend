// mockProfile.ts

export const MOCK_PERFIL = {
  // Informações Básicas
  nome: "Nome do Usuário",
  email: "usuario@ufrpe.br",
  foto_url: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  
  // Para o Barraqueiro e Ambulante
  nome_barraca: "Barraca do Usuário", 
  avaliacao: 4, // Esse número você usa para pintar as estrelinhas
  
  // Para o Ambulante
  local_atual: "Praia de Boa Viagem",

  // Para o Barraqueiro (Lista de associados)
  associados: [
    {
      id: "1",
      nome: "Associado 01",
      email: "associado1@email.com",
      status: "Ativo"
    },
    {
      id: "2",
      nome: "Associado 02",
      email: "associado2@email.com",
      status: "Inativo"
    }
  ]
};