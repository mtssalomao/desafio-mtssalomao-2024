class RecintosZoo {
    constructor() {
        // Define os recintos e os tipos de animais disponíveis de acordo com a tabela disponibilizada.
        this.recintos = [
            { numero: 1, bioma: "savana", tamanhoTotal: 10, animaisExistentes: [{ especie: "MACACO", quantidade: 3 }] },
            { numero: 2, bioma: "floresta", tamanhoTotal: 5, animaisExistentes: [] },
            { numero: 3, bioma: "savana e rio", tamanhoTotal: 7, animaisExistentes: [{ especie: "GAZELA", quantidade: 1 }] },
            { numero: 4, bioma: "rio", tamanhoTotal: 8, animaisExistentes: [] },
            { numero: 5, bioma: "savana", tamanhoTotal: 9, animaisExistentes: [{ especie: "LEAO", quantidade: 1 }] },
        ];

        this.animais = {
            LEAO: { tamanho: 3, biomas: ["savana"], carnivoro: true },
            LEOPARDO: { tamanho: 2, biomas: ["savana"], carnivoro: true },
            CROCODILO: { tamanho: 3, biomas: ["rio"], carnivoro: true },
            MACACO: { tamanho: 1, biomas: ["savana", "floresta"], carnivoro: false },
            GAZELA: { tamanho: 2, biomas: ["savana"], carnivoro: false },
            HIPOPOTAMO: { tamanho: 4, biomas: ["savana", "rio"], carnivoro: false },
        };
    }

    /**
     * Analisa quais recintos podem abrigar o animal solicitado com a quantidade desejada.
     * @param {string} animal - Nome do animal a ser colocado no recinto.
     * @param {number} quantidade - Quantidade de animais.
     * @returns {object} - Lista dos recintos disponíveis ou uma mensagem de erro.
     */
    analisaRecintos(animal, quantidade) {
        const animalValido = this.validaAnimal(animal);
        if (animalValido.erro) return animalValido;

        const quantidadeValida = this.validaQuantidade(quantidade);
        if (quantidadeValida.erro) return quantidadeValida;

        const { tamanho, biomas, carnivoro } = this.animais[animal];
        const recintosViaveis = this.achaRecintoValido(animal, tamanho, quantidade, biomas, carnivoro);
        return recintosViaveis.length > 0
            ? {
                  recintosViaveis: recintosViaveis.map(
                    (r) => `Recinto ${r.numero} (espaço livre: ${r.espacoLivre} total: ${r.tamanhoTotal})`
                ),
              }
            : { erro: "Não há recinto viável" };
    }

    /**
     * Verifica se o animal fornecido é válido.
     * @param {string} animal - Nome do animal.
     * @returns {object} - Retorna um erro se o animal não for encontrado.
     */
    validaAnimal(animal) {
        if (!this.animais[animal]) {
            return { erro: "Animal inválido" };
        }
        return {};
    }

    /**
     * Verifica se a quantidade fornecida é válida.
     * @param {number} quantidade - Quantidade de animais.
     * @returns {object} - Retorna um erro se a quantidade for inválida.
     */
    validaQuantidade(quantidade) {
        if (quantidade <= 0 || !Number.isInteger(quantidade)) {
            return { erro: "Quantidade inválida" };
        }
        return {};
    }

    /**
     * Encontra quais recintos são adequados para o animal, considerando o tamanho e a quantidade.
     * @param {string} animal - Nome do animal.
     * @param {number} tamanho - Tamanho do animal.
     * @param {number} quantidade - Quantidade de animais.
     * @param {Array<string>} biomas - Biomas onde o animal pode viver.
     * @param {boolean} carnivoro - Se o animal é carnívoro ou não.
     * @returns {Array<object>} - Lista de recintos que atendem aos critérios.
     */
    achaRecintoValido(animal, tamanho, quantidade, biomas, carnivoro) {
        return this.recintos
            .filter((recinto) => {
                let espacoOcupado = this.calculaEspacoOcupado(recinto, animal);
                const espacoNecessario = tamanho * quantidade;
                let espacoDisponivel = recinto.tamanhoTotal - espacoOcupado;

                return (
                    this.compatibilidadeBioma(recinto.bioma, biomas) &&
                    this.compatibilidadeCarnivoro(recinto.animaisExistentes, carnivoro) &&
                    espacoDisponivel >= espacoNecessario
                );
            })
            .map((recinto) => ({
                numero: recinto.numero,
                espacoLivre: recinto.tamanhoTotal - tamanho * quantidade - this.calculaEspacoOcupado(recinto, animal),
                tamanhoTotal: recinto.tamanhoTotal,
            }));
    }

    /**
     * Verifica se o animal já está presente no recinto e se é único.
     * @param {string} animal - Nome do animal.
     * @param {object} recinto - O recinto que está sendo verificado.
     * @returns {boolean} - Retorna verdadeiro se o animal for único ou não existir.
     */
    verificaSeEspeciesEhUnicaNoRecinto(animal, recinto) {
        const todasAsEspecies = recinto.animaisExistentes.map((animal) => animal.especie); // Pega todas as espécies
        const especiesUnicas = new Set(todasAsEspecies);
        const animalExiste = recinto.animaisExistentes.some((animalExistente) => animalExistente.especie !== animal);

        if (todasAsEspecies.length !== especiesUnicas.size || !animalExiste) {
            return true;
        }
        return false;
    }

    /**
     * Calcula o espaço já ocupado por animais no recinto.
     * @param {object} recinto - O recinto que está sendo verificado.
     * @param {string} animal - Nome do animal que está sendo adicionado.
     * @returns {number} - Total de espaço ocupado.
     */
    calculaEspacoOcupado(recinto, animal) {
        let espacoOcupado = 0;

        for (let i = 0; i < recinto.animaisExistentes.length; i++) {
            const animalExistente = recinto.animaisExistentes[i];
            const infoEspecie = this.animais[animalExistente.especie];

            if (infoEspecie) {
                espacoOcupado += infoEspecie.tamanho * animalExistente.quantidade;
            }
        }

        // Adiciona espaço extra se o animal já está presente
        if (!this.verificaSeEspeciesEhUnicaNoRecinto(animal, recinto)) {
            espacoOcupado += 1;
        }

        return espacoOcupado;
    }

    /**
     * Verifica se o bioma do recinto é compatível com os biomas do animal.
     * @param {string} recintoBioma - O bioma do recinto.
     * @param {Array<string>} animalBiomas - Os biomas onde o animal pode viver.
     * @returns {boolean} - Retorna verdadeiro se o bioma for compatível.
     */
    compatibilidadeBioma(recintoBioma, animalBiomas) {
        return animalBiomas.some((bioma) => recintoBioma.includes(bioma));
    }

    /**
     * Verifica se o tipo de alimentação do animal é compatível com os animais existentes no recinto.
     * @param {Array<object>} animaisExistentes - Lista de animais existentes no recinto.
     * @param {boolean} animalCarnivoro - Se o animal a ser adicionado é carnívoro.
     * @returns {boolean} - Retorna verdadeiro se a compatibilidade alimentar for adequada.
     */
    compatibilidadeCarnivoro(animaisExistentes, animalCarnivoro) {
        return animaisExistentes.every((a) => this.animais[a.especie].carnivoro === animalCarnivoro);
    }
}

export { RecintosZoo as RecintosZoo };
