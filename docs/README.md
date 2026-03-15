# Ctrl Fleet


*Alexia Fernanda Alves de Andrade

*Guilherme Augusto Martins de Carvalho

*Ítalo Eduardo Carneiro da Silva

*João Victor Vial Leite Soares

*Lucas Maia Marques Pinheiro

*Rafael Galileu Thales Oliveira

---

Professores:


* Lucca Soares de Paiva Lacerda
* Michelle Hanne Soares de Andrade

---

_Curso de Engenharia de Software_

_Instituto de Informática e Ciências Exatas – Pontifícia Universidade Católica de Minas Gerais (PUC MINAS), Belo Horizonte – MG – Brasil_

---

_**Resumo**. 
A gestão de frotas em órgãos públicos ainda é realizada, em muitos casos, por meio de métodos manuais e planilhas eletrônicas pouco estruturadas, o que compromete a eficiência operacional e a transparência no uso dos recursos públicos. Este trabalho propõe o desenvolvimento de um sistema web para controle, monitoramento e gestão de frotas de veículos públicos, contemplando processos como cadastro de veículos e motoristas, registro de uso, controle de manutenções e abastecimento. Como resultado, espera-se uma plataforma funcional que centralize informações, automatize alertas e gere relatórios gerenciais, contribuindo para uma administração pública mais eficiente, rastreável e transparente.

---


## 1. Introdução

Este trabalho apresenta o desenvolvimento de um Sistema Web de Gestão de Frota Pública, voltado à digitalização e automação dos processos administrativos relacionados ao controle de veículos em órgãos governamentais.

### 1.1 Contextualização

A administração pública depende de frotas de veículos para a execução de diversas atividades essenciais, como transporte institucional, fiscalização, manutenção urbana e serviços administrativos em geral. A gestão adequada desses recursos exige controle rigoroso sobre utilização, manutenção, documentação e custos operacionais. No entanto, grande parte dos órgãos públicos brasileiros — prefeituras, secretarias, universidades e autarquias — ainda recorre a métodos manuais ou planilhas eletrônicas pouco estruturadas para realizar esse controle, o que resulta em baixa rastreabilidade, dificuldade de auditoria e maior suscetibilidade a erros e irregularidades.


### 1.2 Problema

A ausência de um sistema informatizado adequado para a gestão de frotas públicas gera uma série de problemas operacionais e administrativos. Entre eles destacam-se: a falta de controle sistemático sobre manutenções preventivas e corretivas, o uso indevido ou não autorizado de veículos oficiais, a ausência de rastreabilidade da quilometragem e do consumo de combustível, e a dificuldade de prestação de contas perante órgãos de controle externo, como os tribunais de contas. Esse cenário compromete a eficiência da administração pública e pode gerar desperdício de recursos financeiros, além de riscos administrativos e legais para os gestores responsáveis.


### 1.3 Objetivo geral

Desenvolver um sistema web para controle, monitoramento e gestão eficiente da frota de veículos de órgãos públicos, centralizando informações, automatizando processos administrativos e apoiando a tomada de decisão gerencial.


#### 1.3.1 Objetivos específicos

*Implementar o cadastro detalhado de veículos, contemplando informações como placa, modelo, ano de fabricação, secretaria vinculada, status de operação e documentação obrigatória (IPVA, seguro e licenciamento).
*Permitir o cadastro de motoristas e o registro de cada utilização de veículo, incluindo responsável, destino, data, horário e quilometragem inicial e final.
*Desenvolver o módulo de controle de manutenções preventivas e corretivas, com registro de ocorrências, histórico por veículo e geração de alertas automáticos baseados em periodicidade ou quilometragem.
*Implementar o controle de abastecimentos, possibilitando o monitoramento do consumo de combustível e a geração de relatórios analíticos de custos e desempenho da frota.
Gerar relatórios gerenciais que subsidiem auditorias, prestações de contas e o planejamento estratégico do uso da frota.

### 1.4 Justificativas

A implantação de um sistema informatizado de gestão de frota pública justifica-se pela necessidade de maior controle, segurança e transparência na utilização dos veículos oficiais. A digitalização desses processos contribui diretamente para a redução de custos com manutenções emergenciais, o melhor planejamento do uso dos veículos e o fortalecimento do controle documental. Além disso, o sistema facilita auditorias e processos de prestação de contas, aumentando a confiabilidade das informações e promovendo uma gestão pública mais responsável. Do ponto de vista acadêmico, o projeto representa a aplicação prática de conceitos de engenharia de software, modelagem de processos de negócio e desenvolvimento web em um contexto de relevância social.


## 2. Participantes do processo

**Gestor de frota —** principal usuário operacional do sistema. Trata-se de um servidor público com nível médio ou superior de escolaridade, responsável pelo acompanhamento geral da frota. Utiliza o sistema para cadastrar veículos, acompanhar manutenções, analisar relatórios e tomar decisões administrativas. Necessita de uma interface clara e com acesso rápido a indicadores e alertas.
**Motorista —** usuário com perfil operacional, podendo ter diferentes níveis de escolaridade e familiaridade com tecnologia. É responsável por registrar informações de uso do veículo, como quilometragem, destino e horários. A interface destinada a esse perfil deve ser simples e intuitiva.
**Setor administrativo e financeiro —** servidores responsáveis pelo controle interno de custos e documentação. Utilizam o sistema para acompanhar despesas com combustível e manutenção, além de controlar a regularidade documental dos veículos. Possuem, em geral, nível superior de escolaridade e experiência com ferramentas de gestão.

## 3. Modelagem do processo de negócio

### 3.1. Análise da situação atual

_Apresente uma descrição textual de como os sistemas atuais resolvem o problema que seu projeto se propõe a resolver. Caso sua proposta seja inovadora e não existam processos claramente definidos, **apresente como as tarefas que o seu sistema pretende implementar são executadas atualmente**, mesmo que não se utilize tecnologia computacional._

### 3.2. Descrição geral da proposta de solução

_Apresente aqui uma descrição da sua proposta abordando seus limites e suas ligações com as estratégias do negócio e os objetivos geral e específicos do projeto. Apresente aqui as oportunidades de melhorias._

### 3.3. Modelagem dos processos

[PROCESSO 1 - Nome do Processo](processo-1-nome-do-processo.md "Detalhamento do Processo 1.")

[PROCESSO 2 - Nome do Processo](processo-2-nome-do-processo.md "Detalhamento do Processo 2.")

[PROCESSO 3 - Nome do Processo](processo-3-nome-do-processo.md "Detalhamento do Processo 3.")

[PROCESSO 4 - Nome do Processo](processo-4-nome-do-processo.md "Detalhamento do Processo 4.")

## 4. Projeto da solução

_O documento a seguir apresenta o detalhamento do projeto da solução. São apresentadas duas seções que descrevem, respectivamente: modelo relacional e tecnologias._

[Projeto da solução](solution-design.md "Detalhamento do projeto da solução: modelo relacional e tecnologias.")


## 5. Indicadores de desempenho

_O documento a seguir apresenta os indicadores de desempenho dos processos._

[Indicadores de desempenho dos processos](performance-indicators.md)


## 6. Interface do sistema

_A sessão a seguir apresenta a descrição do produto de software desenvolvido._ 

[Documentação da interface do sistema](interface.md)

## 7. Conclusão

_Apresente aqui a conclusão do seu trabalho. Deve ser apresentada aqui uma discussão dos resultados obtidos no trabalho, local em que se verifica as observações pessoais de cada aluno. Essa seção poderá também apresentar sugestões de novas linhas de estudo._

# REFERÊNCIAS

_Como um projeto de software não requer revisão bibliográfica, a inclusão das referências não é obrigatória. No entanto, caso você deseje incluir referências relacionadas às tecnologias, padrões, ou metodologias que serão usadas no seu trabalho, relacione-as de acordo com a ABNT._

_Verifique no link abaixo como devem ser as referências no padrão ABNT:_

http://portal.pucminas.br/imagedb/documento/DOC_DSC_NOME_ARQUI20160217102425.pdf

**[1.1]** - _ELMASRI, Ramez; NAVATHE, Sham. **Sistemas de banco de dados**. 7. ed. São Paulo: Pearson, c2019. E-book. ISBN 9788543025001._

**[1.2]** - _COPPIN, Ben. **Inteligência artificial**. Rio de Janeiro, RJ: LTC, c2010. E-book. ISBN 978-85-216-2936-8._

**[1.3]** - _CORMEN, Thomas H. et al. **Algoritmos: teoria e prática**. Rio de Janeiro, RJ: Elsevier, Campus, c2012. xvi, 926 p. ISBN 9788535236996._

**[1.4]** - _SUTHERLAND, Jeffrey Victor. **Scrum: a arte de fazer o dobro do trabalho na metade do tempo**. 2. ed. rev. São Paulo, SP: Leya, 2016. 236, [4] p. ISBN 9788544104514._

**[1.5]** - _RUSSELL, Stuart J.; NORVIG, Peter. **Inteligência artificial**. Rio de Janeiro: Elsevier, c2013. xxi, 988 p. ISBN 9788535237016._



# APÊNDICES


_Atualizar os links e adicionar novos links para que a estrutura do código esteja corretamente documentada._


## Apêndice A - Código fonte

[Código do front-end](../src/front) -- repositório do código do front-end

[Código do back-end](../src/back)  -- repositório do código do back-end


## Apêndice B - Apresentação final


[Slides da apresentação final](presentations/)


[Vídeo da apresentação final](video/)






