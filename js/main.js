document.addEventListener('DOMContentLoaded', () => {
    // Inicializa AOS com configurações suaves
    AOS.init({
        duration: 520,
        once: true,
        offset: 70,
        easing: 'ease-out-quad'
    });

    // Busca no blog
    const searchInput = document.querySelector('.blog-search input[type="search"]');
    if (searchInput) {
        const blogMain = document.querySelector('main');
        const blogHero = document.querySelector('.blog-home-hero');
        const recentGrid = document.querySelector('.blog-home-grid');
        const recentLabel = document.querySelector('.blog-home-toolbar .blog-section-label span');
        let searchResultsContainer = null;

        const maxDisplayLength = 28;
        const formatDisplayTerm = (term) => {
            return term.length > maxDisplayLength ? term.slice(0, maxDisplayLength - 3) + '...' : term;
        };

        const normalizeString = (value) => {
            return value
                .normalize('NFD')
                .replace(/\p{Diacritic}/gu, '')
                .toLowerCase();
        };

        const formatSearchLabel = (term) => {
            return `Resultados para "${formatDisplayTerm(term)}"`;
        };

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            const queryLower = normalizeString(query);

            if (query) {
                if (recentLabel) {
                    recentLabel.textContent = formatSearchLabel(query);
                    recentLabel.setAttribute('title', `Resultados para "${query}"`);
                }

                // Ocultar sections de posts e aside, mas manter hero e a section com a barra de pesquisa
                const sectionsToHide = blogMain.querySelectorAll('section:not(.blog-home-hero)');
                sectionsToHide.forEach(el => {
                    if (!el.querySelector('.blog-search')) {
                        el.style.display = 'none';
                    }
                });
                const aside = blogMain.querySelector('aside');
                if (aside) aside.style.display = 'none';

                // Esconder o bloco 'Mais recentes' dentro da mesma section do toolbar
                if (recentGrid) recentGrid.style.display = 'none';

                // Criar container de resultados se não existir
                if (!searchResultsContainer) {
                    searchResultsContainer = document.createElement('div');
                    searchResultsContainer.className = 'blog-search-results container';
                    searchResultsContainer.style.paddingTop = '2rem';
                    searchResultsContainer.style.paddingBottom = '2rem';
                    const searchSection = document.querySelector('.blog-home-toolbar')?.closest('section') || blogHero;
                    searchSection.parentNode.insertBefore(searchResultsContainer, searchSection.nextSibling);
                } else {
                    searchResultsContainer.innerHTML = '';
                }

                // Filtrar e adicionar cards ao container (apenas .blog-card para formato retangular)
                const blogCards = document.querySelectorAll('.blog-card');
                let hasResults = false;
                blogCards.forEach(card => {
                    const titleElement = card.querySelector('h3');
                    if (titleElement) {
                        const titleText = normalizeString(titleElement.textContent);
                        if (titleText.includes(queryLower)) {
                            const clonedCard = card.cloneNode(true);
                            searchResultsContainer.appendChild(clonedCard);
                            hasResults = true;
                        }
                    }
                });

                if (!hasResults) {
                    const displayQuery = formatDisplayTerm(query);
                    searchResultsContainer.innerHTML = `<p class="text-center" title="Nenhum post encontrado para \"${query}\"">Nenhum post encontrado para "${displayQuery}".</p>`;
                }
            } else {
                if (recentLabel) {
                    recentLabel.textContent = 'Mais recentes';
                    recentLabel.removeAttribute('title');
                }

                // Mostrar tudo quando busca vazia
                const sectionsToShow = blogMain.querySelectorAll('section, aside');
                sectionsToShow.forEach(el => el.style.display = '');
                if (recentGrid) recentGrid.style.display = '';
                if (searchResultsContainer) {
                    searchResultsContainer.remove();
                    searchResultsContainer = null;
                }
            }
        });
    }

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Smooth scroll para links âncora
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Fecha o menu mobile se estiver aberto
                const navbarCollapse = document.querySelector('.navbar-collapse');
                if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                    const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                    if (bsCollapse) bsCollapse.hide();
                }
            }
        });
    });

    // Atualiza link ativo no menu conforme scroll
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateActiveLink() {
        let current = '';
        const scrollPosition = window.scrollY + 150;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href && href.substring(1) === current) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink);
    updateActiveLink();

    // ============================================
    // CALCULADORAS
    // ============================================
    const calculatorModalElement = document.getElementById('calculatorModal');
    const modal = calculatorModalElement ? new bootstrap.Modal(calculatorModalElement) : null;
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    function showCalculationResult(containerId, html) {
        const resultContainer = document.getElementById(containerId);
        if (resultContainer) {
            resultContainer.hidden = false;
            resultContainer.innerHTML = html;
        }
    }


    function isPositiveNumber(value) {
        return !isNaN(value) && isFinite(value) && value > 0;
    }

    window.openCalculator = function(type) {
        if (!modal || !modalTitle || !modalBody) return;
        // CALCULADORA 1: IMC
        if (type === 'imc') {
            modalTitle.textContent = 'Calculadora de IMC';
            modalBody.innerHTML = `
                <div class="calculator-input">
                    <label for="height">Altura (m)</label>
                    <input type="number" id="height" step="0.01" min="0" placeholder="Ex: 1.75" class="form-control">
                </div>
                <div class="calculator-input">
                    <label for="weight">Peso (kg)</label>
                    <input type="number" id="weight" step="0.1" min="0" placeholder="Ex: 70.5" class="form-control">
                </div>
                <button type="button" class="btn btn-primary-custom w-100 mt-2" onclick="calculateIMC()">Calcular IMC</button>
                <div id="imcResult" class="result-box mt-3" hidden></div>
            `;
        } 
        // CALCULADORA 2: % GORDURA
        else if (type === 'bodyfat') {
            modalTitle.textContent = 'Percentual de Gordura';
            modalBody.innerHTML = `
                <div class="calculator-input">
                    <label for="gender">Sexo</label>
                    <select id="gender" class="form-select">
                        <option value="male">Masculino</option>
                        <option value="female">Feminino</option>
                    </select>
                </div>
                <div class="calculator-input">
                    <label for="waist">Circunferência da cintura (cm)</label>
                    <input type="number" id="waist" min="0" class="form-control">
                </div>
                <div class="calculator-input">
                    <label for="neck">Circunferência do pescoço (cm)</label>
                    <input type="number" id="neck" min="0" class="form-control">
                </div>
                <div class="calculator-input" id="hipField" hidden>
                    <label for="hip">Circunferência do quadril (cm)</label>
                    <input type="number" id="hip" min="0" class="form-control">
                </div>
                <button type="button" class="btn btn-primary-custom w-100 mt-2" onclick="calculateBodyFat()">Calcular Percentual</button>
                <div id="fatResult" class="result-box mt-3" hidden></div>
            `;

            const genderSelect = document.getElementById('gender');
            const hipField = document.getElementById('hipField');
            if (genderSelect && hipField) {
                genderSelect.addEventListener('change', () => {
                    hipField.hidden = genderSelect.value !== 'female';
                });
            }
        } 
        // CALCULADORA 3: TMB
        else if (type === 'tmb') {
            modalTitle.textContent = 'Taxa Metabólica Basal (TMB)';
            modalBody.innerHTML = `
                <div class="calculator-input">
                    <label for="genderTMB">Sexo</label>
                    <select id="genderTMB" class="form-select">
                        <option value="male">Masculino</option>
                        <option value="female">Feminino</option>
                    </select>
                </div>
                <div class="calculator-input">
                    <label for="ageTMB">Idade (anos)</label>
                    <input type="number" id="ageTMB" min="0" class="form-control">
                </div>
                <div class="calculator-input">
                    <label for="weightTMB">Peso (kg)</label>
                    <input type="number" id="weightTMB" min="0" step="0.1" class="form-control">
                </div>
                <div class="calculator-input">
                    <label for="heightTMB">Altura (cm)</label>
                    <input type="number" id="heightTMB" min="0" class="form-control">
                </div>
                <div class="calculator-input">
                    <label for="activity">Nível de atividade</label>
                    <select id="activity" class="form-select">
                        <option value="1.2">Sedentário (pouco ou nenhum exercício)</option>
                        <option value="1.375">Levemente ativo (exercício 1-3 dias/semana)</option>
                        <option value="1.55">Moderadamente ativo (exercício 3-5 dias/semana)</option>
                        <option value="1.725">Muito ativo (exercício 6-7 dias/semana)</option>
                        <option value="1.9">Extremamente ativo (exercício diário e trabalho físico)</option>
                    </select>
                </div>
                <button type="button" class="btn btn-primary-custom w-100 mt-2" onclick="calculateTMB()">Calcular TMB</button>
                <div id="tmbResult" class="result-box mt-3" hidden></div>
            `;
        }
        // CALCULADORA 4: TDEE (GASTO TOTAL)
        else if (type === 'tdee') {
            modalTitle.textContent = 'Gasto Energético Total (TDEE)';
            modalBody.innerHTML = `
                <div class="calculator-input">
                    <label for="genderTDEE">Sexo</label>
                    <select id="genderTDEE" class="form-select">
                        <option value="male">Masculino</option>
                        <option value="female">Feminino</option>
                    </select>
                </div>
                <div class="calculator-input">
                    <label for="ageTDEE">Idade (anos)</label>
                    <input type="number" id="ageTDEE" min="0" class="form-control">
                </div>
                <div class="calculator-input">
                    <label for="weightTDEE">Peso (kg)</label>
                    <input type="number" id="weightTDEE" min="0" step="0.1" class="form-control">
                </div>
                <div class="calculator-input">
                    <label for="heightTDEE">Altura (cm)</label>
                    <input type="number" id="heightTDEE" min="0" class="form-control">
                </div>
                <div class="calculator-input">
                    <label for="activityTDEE">Nível de atividade</label>
                    <select id="activityTDEE" class="form-select">
                        <option value="1.2">Sedentário (pouco ou nenhum exercício)</option>
                        <option value="1.375">Levemente ativo (exercício 1-3 dias/semana)</option>
                        <option value="1.55">Moderadamente ativo (exercício 3-5 dias/semana)</option>
                        <option value="1.725">Muito ativo (exercício 6-7 dias/semana)</option>
                        <option value="1.9">Extremamente ativo (exercício diário e trabalho físico)</option>
                    </select>
                </div>
                <button type="button" class="btn btn-primary-custom w-100 mt-2" onclick="calculateTDEE()">Calcular TDEE</button>
                <div id="tdeeResult" class="result-box mt-3" hidden></div>
            `;
        }
        // CALCULADORA 5: MACRONUTRIENTES
        else if (type === 'macros') {
            modalTitle.textContent = 'Distribuição de Macronutrientes';
            modalBody.innerHTML = `
                <div class="calculator-input">
                    <label for="macrosCalorias">Suas calorias diárias (kcal)</label>
                    <input type="number" id="macrosCalorias" step="10" min="0" placeholder="Ex: 2500" class="form-control">
                    <small class="text-muted">Use o resultado da calculadora TDEE</small>
                </div>
                <div class="calculator-input">
                    <label for="macrosObjetivo">Seu objetivo</label>
                    <select id="macrosObjetivo" class="form-select">
                        <option value="emagrecimento">Emagrecimento (P:30% | C:40% | G:30%)</option>
                        <option value="manutencao">Manutenção (P:25% | C:50% | G:25%)</option>
                        <option value="hipertrofia">Hipertrofia (P:30% | C:50% | G:20%)</option>
                    </select>
                </div>
                <button type="button" class="btn btn-primary-custom w-100 mt-2" onclick="calculateMacros()">Calcular Macronutrientes</button>
                <div id="macrosResult" class="result-box mt-3" hidden></div>
            `;
        }
        // CALCULADORA 6: PROTEÍNA DIÁRIA (VERSÃO AVANÇADA)
        else if (type === 'proteina') {
            modalTitle.textContent = 'Calculadora Avançada de Proteína Diária';
            modalBody.innerHTML = `
                <div class="calculator-input">
                    <label for="proteinaPeso">Peso (kg) *</label>
                    <input type="number" id="proteinaPeso" step="0.1" min="0" placeholder="Ex: 70" class="form-control">
                </div>
                <div class="calculator-input">
                    <label for="proteinaSexo">Sexo *</label>
                    <select id="proteinaSexo" class="form-select">
                        <option value="masculino">Masculino</option>
                        <option value="feminino">Feminino</option>
                    </select>
                </div>
                <div class="calculator-input">
                    <label for="proteinaIdade">Idade (anos) *</label>
                    <input type="number" id="proteinaIdade" step="1" min="15" max="100" placeholder="Ex: 30" class="form-control">
                </div>
                <div class="calculator-input">
                    <label for="proteinaAtividade">Nível de Atividade Física *</label>
                    <select id="proteinaAtividade" class="form-select">
                        <option value="sedentario">Sedentário (pouco ou nenhum exercício)</option>
                        <option value="leve">Levemente ativo (1-3 dias/semana)</option>
                        <option value="moderado">Moderadamente ativo (3-5 dias/semana)</option>
                        <option value="intenso">Intenso (6-7 dias/semana)</option>
                        <option value="atleta">Atleta (treino 2x/dia ou alta performance)</option>
                    </select>
                </div>
                <div class="calculator-input">
                    <label for="proteinaObjetivo">Objetivo Principal *</label>
                    <select id="proteinaObjetivo" class="form-select">
                        <option value="emagrecimento">Emagrecimento / Déficit calórico</option>
                        <option value="hipertrofia">Hipertrofia / Ganho de massa muscular</option>
                        <option value="manutencao">Manutenção do peso e composição</option>
                        <option value="recomposicao">Recomposição corporal (perder gordura e ganhar músculo)</option>
                    </select>
                </div>
                <div class="calculator-input">
                    <label for="proteinaGordura">Percentual de gordura estimado (opcional)</label>
                    <input type="number" id="proteinaGordura" step="1" min="5" max="50" placeholder="Ex: 20" class="form-control">
                    <small class="text-muted">Deixe em branco se não souber. Use a calculadora de % de gordura.</small>
                </div>
                <button type="button" class="btn btn-primary-custom w-100 mt-2" onclick="calculateProteinaAvancada()">Calcular Proteína</button>
                <div id="proteinaResult" class="result-box mt-3" hidden></div>
            `;
        }
        modal.show();
    };

    // ============================================
    // FUNÇÕES DE CÁLCULO
    // ============================================

    // 1. IMC
    window.calculateIMC = function() {
        const height = parseFloat(document.getElementById('height')?.value);
        const weight = parseFloat(document.getElementById('weight')?.value);

        if (!isPositiveNumber(height) || !isPositiveNumber(weight)) {
            showCalculationResult('imcResult', '<p class="text-danger">Por favor, preencha altura e peso com valores válidos.</p>');
            return;
        }

        const imc = weight / (height * height);
        let classification = '';
        let recommendation = '';

        if (imc < 18.5) {
            classification = 'Abaixo do peso';
            recommendation = 'Um plano com foco em fortalecimento e ganho de massa pode ser o ideal.';
        } else if (imc < 25) {
            classification = 'Peso adequado';
            recommendation = 'Seu peso está dentro do recomendado. Foco em manutenção e definição.';
        } else if (imc < 30) {
            classification = 'Sobrepeso';
            recommendation = 'Um plano de emagrecimento com treino e estratégia alimentar pode trazer ótimos resultados.';
        } else if (imc < 35) {
            classification = 'Obesidade grau I';
            recommendation = 'Iniciar com acompanhamento profissional é essencial para segurança e eficiência.';
        } else {
            classification = 'Obesidade (grau II ou III)';
            recommendation = 'É importante buscar um programa supervisionado para proteger articulações e garantir evolução.';
        }

        showCalculationResult('imcResult', `
            <div class="result-value">${imc.toFixed(1)} kg/m²</div>
            <p><strong>Classificação:</strong> ${classification}</p>
            <p>${recommendation}</p>
            <small class="text-muted">*Esta é uma estimativa. Consulte um profissional para uma avaliação completa.</small>
        `);
    };

    // 2. Percentual de Gordura
    window.calculateBodyFat = function() {
        const gender = document.getElementById('gender')?.value;
        const waist = parseFloat(document.getElementById('waist')?.value);
        const neck = parseFloat(document.getElementById('neck')?.value);

        if (!isPositiveNumber(waist) || !isPositiveNumber(neck)) {
            showCalculationResult('fatResult', '<p class="text-danger">Informe medidas válidas para cintura e pescoço.</p>');
            return;
        }

        let bodyFat = 0;
        if (gender === 'male') {
            bodyFat = 86.01 * Math.log10(waist - neck) - 70.041 * Math.log10(170) + 36.76;
        } else {
            const hip = parseFloat(document.getElementById('hip')?.value);
            if (!isPositiveNumber(hip)) {
                showCalculationResult('fatResult', '<p class="text-danger">Informe uma medida válida de quadril.</p>');
                return;
            }
            bodyFat = 163.205 * Math.log10(waist + hip - neck) - 97.684 * Math.log10(170) - 78.387;
        }

        bodyFat = Math.min(Math.max(bodyFat, 4), 50);

        let classification = '';
        if (gender === 'male') {
            if (bodyFat < 8) classification = 'Essencial (atleta)';
            else if (bodyFat < 15) classification = 'Excelente';
            else if (bodyFat < 22) classification = 'Bom';
            else if (bodyFat < 28) classification = 'Atenção';
            else classification = 'Risco alto';
        } else {
            if (bodyFat < 14) classification = 'Essencial (atleta)';
            else if (bodyFat < 21) classification = 'Excelente';
            else if (bodyFat < 28) classification = 'Bom';
            else if (bodyFat < 33) classification = 'Atenção';
            else classification = 'Risco alto';
        }

        showCalculationResult('fatResult', `
            <div class="result-value">${bodyFat.toFixed(1)}%</div>
            <p><strong>Classificação:</strong> ${classification}</p>
            <small class="text-muted">*Este é um valor estimado. Para maior precisão, recomenda-se uma avaliação física profissional.</small>
        `);
    };

    // 3. TMB + Gasto Diário
    window.calculateTMB = function() {
        const gender = document.getElementById('genderTMB')?.value;
        const age = parseFloat(document.getElementById('ageTMB')?.value);
        const weight = parseFloat(document.getElementById('weightTMB')?.value);
        const height = parseFloat(document.getElementById('heightTMB')?.value);
        const activity = parseFloat(document.getElementById('activity')?.value);

        if (!isPositiveNumber(age) || !isPositiveNumber(weight) || !isPositiveNumber(height) || !isPositiveNumber(activity)) {
            showCalculationResult('tmbResult', '<p class="text-danger">Preencha todos os campos corretamente.</p>');
            return;
        }

        let tmb;
        if (gender === 'male') {
            tmb = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
        } else {
            tmb = 447.593 + (9.247 * weight) + (3.098 * height) - (4.33 * age);
        }

        const dailyCalories = tmb * activity;
        const fatLossCalories = dailyCalories - 500;

        showCalculationResult('tmbResult', `
            <div class="result-value">${tmb.toFixed(0)} kcal</div>
            <p><strong>Taxa metabólica basal (TMB):</strong> ${tmb.toFixed(0)} calorias/dia</p>
            <p><strong>Gasto calórico diário estimado:</strong> ${dailyCalories.toFixed(0)} calorias</p>
            <p><strong>Referência para emagrecimento:</strong> ${fatLossCalories.toFixed(0)} calorias/dia</p>
            <small class="text-muted">*Estes valores são estimativas. Um plano alimentar individualizado é fundamental.</small>
        `);
    };

    // 4. TDEE (Gasto Energético Total)
    window.calculateTDEE = function() {
        const gender = document.getElementById('genderTDEE')?.value;
        const age = parseFloat(document.getElementById('ageTDEE')?.value);
        const weight = parseFloat(document.getElementById('weightTDEE')?.value);
        const height = parseFloat(document.getElementById('heightTDEE')?.value);
        const activity = parseFloat(document.getElementById('activityTDEE')?.value);

        if (!isPositiveNumber(age) || !isPositiveNumber(weight) || !isPositiveNumber(height) || !isPositiveNumber(activity)) {
            showCalculationResult('tdeeResult', '<p class="text-danger">Preencha todos os campos corretamente.</p>');
            return;
        }

        let tmb;
        if (gender === 'male') {
            tmb = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
        } else {
            tmb = 447.593 + (9.247 * weight) + (3.098 * height) - (4.33 * age);
        }

        const tdee = tmb * activity;
        const deficit = tdee - 500;
        const superavit = tdee + 300;

        showCalculationResult('tdeeResult', `
            <div class="result-value">${Math.round(tdee)} kcal/dia</div>
            <p><strong>Seu gasto calórico total é:</strong> ${Math.round(tdee)} calorias por dia</p>
            <p><strong>🔻 Para emagrecer:</strong> ${Math.round(deficit)} kcal/dia (déficit de 500kcal)</p>
            <p><strong>🔺 Para ganhar massa:</strong> ${Math.round(superavit)} kcal/dia (superávit de 300kcal)</p>
            <small class="text-muted">*Ajustes individuais podem ser necessários. Acompanhamento profissional é recomendado.</small>
        `);
    };

    // 5. Macronutrientes
    window.calculateMacros = function() {
        const calorias = parseFloat(document.getElementById('macrosCalorias')?.value);
        const objetivo = document.getElementById('macrosObjetivo')?.value;

        if (!isPositiveNumber(calorias)) {
            showCalculationResult('macrosResult', '<p class="text-danger">Informe suas calorias diárias válidas. Use a calculadora TDEE primeiro.</p>');
            return;
        }

        let percentualP, percentualC, percentualG;
        
        switch(objetivo) {
            case 'emagrecimento':
                percentualP = 0.30;
                percentualC = 0.40;
                percentualG = 0.30;
                break;
            case 'manutencao':
                percentualP = 0.25;
                percentualC = 0.50;
                percentualG = 0.25;
                break;
            case 'hipertrofia':
                percentualP = 0.30;
                percentualC = 0.50;
                percentualG = 0.20;
                break;
            default:
                percentualP = 0.25;
                percentualC = 0.50;
                percentualG = 0.25;
        }

        const kcalP = calorias * percentualP;
        const kcalC = calorias * percentualC;
        const kcalG = calorias * percentualG;
        
        const gramasP = kcalP / 4;
        const gramasC = kcalC / 4;
        const gramasG = kcalG / 9;

        showCalculationResult('macrosResult', `
            <div class="result-value">${Math.round(calorias)} kcal</div>
            <p><strong>🥩 Proteína:</strong> ${Math.round(gramasP)}g (${Math.round(kcalP)} kcal) - ${Math.round(percentualP * 100)}%</p>
            <p><strong>🍚 Carboidrato:</strong> ${Math.round(gramasC)}g (${Math.round(kcalC)} kcal) - ${Math.round(percentualC * 100)}%</p>
            <p><strong>🥑 Gordura:</strong> ${Math.round(gramasG)}g (${Math.round(kcalG)} kcal) - ${Math.round(percentualG * 100)}%</p>
            <small class="text-muted">*Distribuição baseada no seu objetivo. Ajustes podem ser feitos conforme necessidade individual.</small>
        `);
    };

    // 6. Proteína Diária - VERSÃO AVANÇADA (completa)
    window.calculateProteinaAvancada = function() {
        const peso = parseFloat(document.getElementById('proteinaPeso')?.value);
        const sexo = document.getElementById('proteinaSexo')?.value;
        const idade = parseFloat(document.getElementById('proteinaIdade')?.value);
        const atividade = document.getElementById('proteinaAtividade')?.value;
        const objetivo = document.getElementById('proteinaObjetivo')?.value;
        const gorduraInput = document.getElementById('proteinaGordura')?.value;
        const gordura = gorduraInput ? parseFloat(gorduraInput) : null;

        // Validações
        if (!isPositiveNumber(peso) || !isPositiveNumber(idade) || !sexo || !atividade || !objetivo) {
            showCalculationResult('proteinaResult', '<p class="text-danger">⚠️ Preencha todos os campos obrigatórios corretamente.</p>');
            return;
        }

        if (idade < 15 || idade > 100) {
            showCalculationResult('proteinaResult', '<p class="text-danger">⚠️ Idade deve estar entre 15 e 100 anos.</p>');
            return;
        }

        // ============================================
        // CÁLCULO DA PROTEÍNA BASE (g/kg)
        // ============================================
        
        // 1. Ajuste por nível de atividade
        const atividadeMap = {
            'sedentario': { min: 0.8, max: 1.0, label: 'sedentário' },
            'leve': { min: 1.0, max: 1.4, label: 'levemente ativo' },
            'moderado': { min: 1.4, max: 1.8, label: 'moderadamente ativo' },
            'intenso': { min: 1.8, max: 2.2, label: 'intenso' },
            'atleta': { min: 2.2, max: 2.8, label: 'atleta' }
        };
        
        let minProtein = atividadeMap[atividade].min;
        let maxProtein = atividadeMap[atividade].max;
        
        // 2. Ajuste por objetivo
        const objetivoMap = {
            'emagrecimento': { fator: 1.2, descricao: 'déficit calórico' },
            'hipertrofia': { fator: 1.3, descricao: 'ganho de massa muscular' },
            'manutencao': { fator: 1.0, descricao: 'manutenção' },
            'recomposicao': { fator: 1.15, descricao: 'recomposição corporal' }
        };
        
        const fatorObjetivo = objetivoMap[objetivo].fator;
        minProtein = minProtein * fatorObjetivo;
        maxProtein = maxProtein * fatorObjetivo;
        
        // 3. Ajuste por idade (acima de 50 anos precisa de mais proteína)
        if (idade > 50) {
            const idadeFator = 1 + ((idade - 50) / 100);
            minProtein = minProtein * Math.min(idadeFator, 1.3);
            maxProtein = maxProtein * Math.min(idadeFator, 1.3);
        }
        
        // 4. Ajuste por sexo (mulheres geralmente precisam de um pouco menos)
        if (sexo === 'feminino') {
            minProtein = minProtein * 0.95;
            maxProtein = maxProtein * 0.95;
        }
        
        // 5. Ajuste por percentual de gordura (músculo magro é mais relevante)
        let massaMagra = peso;
        if (gordura && gordura > 0 && gordura < 50) {
            const percentualMagro = (100 - gordura) / 100;
            massaMagra = peso * percentualMagro;
            // Se tem % de gordura, usamos massa magra para cálculo mais preciso
            minProtein = minProtein * (massaMagra / peso);
            maxProtein = maxProtein * (massaMagra / peso);
        }
        
        // Garantir valores mínimos e máximos saudáveis
        minProtein = Math.max(minProtein, 1.0);
        maxProtein = Math.min(maxProtein, 3.0);
        
        const proteinaMin = peso * minProtein;
        const proteinaMax = peso * maxProtein;
        const proteinaMedia = (proteinaMin + proteinaMax) / 2;
        
        // Calcular por refeição (considerando 4-5 refeições)
        const porRefeicaoMin = Math.round(proteinaMedia / 5);
        const porRefeicaoMax = Math.round(proteinaMedia / 3);
        
        // Calorias provenientes de proteína (4 kcal por grama)
        const caloriasProteina = Math.round(proteinaMedia * 4);
        
        // ============================================
        // RECOMENDAÇÕES PERSONALIZADAS
        // ============================================
        
        let recomendacao = '';
        let fontesProteina = '';
        
        if (objetivo === 'emagrecimento') {
            recomendacao = 'Em déficit calórico, a proteína mais alta ajuda a preservar massa muscular. Priorize fontes magras.';
            fontesProteina = '🥩 Peito de frango, 🐟 peixes, 🥚 claras de ovos, 🧀 cottage, 🌱 proteína de soja';
        } else if (objetivo === 'hipertrofia') {
            recomendacao = 'Distribua a proteína em 4-5 refeições ao longo do dia para maximizar a síntese muscular.';
            fontesProteina = '🥩 Carnes magras, 🍗 frango, 🐟 salmão, 🥚 ovos inteiros, 🥛 whey protein, 🥜 leguminosas';
        } else if (objetivo === 'recomposicao') {
            recomendacao = 'Treino de força + proteína adequada são essenciais para ganhar músculo enquanto perde gordura.';
            fontesProteina = '🥩 Proteínas magras variadas, distribuição uniforme nas refeições';
        } else {
            recomendacao = 'Mantenha a ingestão consistente para preservar sua massa muscular e função metabólica.';
            fontesProteina = '🥩 Combinação de proteínas animais e vegetais ao longo do dia';
        }
        
        // Adicionar observação para idosos
        let observacaoIdade = '';
        if (idade > 60) {
            observacaoIdade = `<p><strong>👴 Importante para sua idade:</strong> Pessoas com mais de 60 anos têm maior necessidade proteica para combater a sarcopenia. Distribua bem as refeições.</p>`;
        }
        
        // Adicionar observação para massa magra
        let observacaoMassaMagra = '';
        if (gordura && gordura > 0) {
            observacaoMassaMagra = `<p><strong>📊 Baseado na sua massa magra:</strong> Seu peso ajustado é de aproximadamente ${massaMagra.toFixed(1)}kg de massa magra.</p>`;
        }
        
        showCalculationResult('proteinaResult', `
            <div class="result-value">${Math.round(proteinaMin)} - ${Math.round(proteinaMax)} g/dia</div>
            
            <p><strong>🎯 Recomendação para ${peso}kg:</strong> ${Math.round(proteinaMin)} a ${Math.round(proteinaMax)} gramas de proteína por dia</p>
            <p><strong>⭐ Valor médio diário sugerido:</strong> ${Math.round(proteinaMedia)} gramas</p>
            <p><strong>🔥 Calorias provenientes de proteína:</strong> ~${caloriasProteina} kcal/dia</p>
            
            <hr>
            
            <p><strong>🍽️ Distribuição sugerida (${Math.round(proteinaMedia)}g totais):</strong><br>
            • ${porRefeicaoMin}-${porRefeicaoMax}g por refeição (4-5 refeições/dia)<br>
            • Pós-treino: 20-40g para otimizar recuperação</p>
            
            ${observacaoIdade}
            ${observacaoMassaMagra}
            
            <p><strong>💡 Recomendação:</strong> ${recomendacao}</p>
            <p><strong>🥗 Fontes recomendadas:</strong> ${fontesProteina}</p>
            
            <small class="text-muted">*Baseado na literatura científica atual (ISSN, ACSM). Ajustes individuais podem ser necessários. Consulte um nutricionista para um plano personalizado.</small>
        `);
    };

    // Abrir calculadoras ao clicar nos botões
    document.querySelectorAll('.tool-trigger').forEach(btn => {
        btn.addEventListener('click', () => {
            openCalculator(btn.dataset.calculator);
        });
    });

    const blogPostCatalog = [
        { title: 'Como ajustar a ingestao proteica sem complicar a rotina', category: 'Nutricao e Suplementacao', url: 'blog/emagrecimento.html', coverClass: 'blog-cover-weightloss', publishedAt: '2026-04-05', heroTitle: 'Como ajustar a <span class="blog-title-accent">ingestao proteica</span> sem complicar a rotina', heroExcerpt: 'Uma base simples para melhorar alimentacao, manter constancia e sustentar o processo sem excessos.' },
        { title: 'Quando mudar o treino e quando insistir mais um pouco', category: 'Treino e Exercicios', url: 'blog/hipertrofia.html', coverClass: 'blog-cover-hypertrophy', publishedAt: '2026-04-04', heroTitle: 'Quando <span class="blog-title-accent">mudar</span> o treino e quando insistir mais um pouco', heroExcerpt: 'Entenda como ler o progresso com mais clareza antes de trocar tudo ou estagnar no mesmo plano.' },
        { title: 'Dor, fadiga ou excesso de treino: sinais que pedem atencao', category: 'Saude e Bem-Estar', url: 'blog/lesoes.html', coverClass: 'blog-cover-rehab', publishedAt: '2026-04-03', heroTitle: 'Dor, fadiga ou <span class="blog-title-accent">excesso</span> de treino: sinais que pedem atencao', heroExcerpt: 'Aprender a interpretar os sinais do corpo ajuda a preservar resultado e manter a evolucao no longo prazo.' },
        { title: 'Guia rapido para organizar uma semana de treino mais funcional', category: 'Guias e Tutoriais', url: 'blog/hipertrofia.html', coverClass: 'blog-cover-hypertrophy', publishedAt: '2026-04-02', heroTitle: 'Guia rapido para organizar uma semana de treino mais <span class="blog-title-accent">funcional</span>', heroExcerpt: 'Uma estrutura direta para distribuir melhor volume, foco e recuperacao na semana.' },
        { title: 'Ajustes simples que deixam o treino mais eficiente no dia a dia', category: 'Dicas e Tecnicas de Treino', url: 'blog/lesoes.html', coverClass: 'blog-cover-rehab', publishedAt: '2026-04-01', heroTitle: '<span class="blog-title-accent">Ajustes simples</span> que deixam o treino mais eficiente no dia a dia', heroExcerpt: 'Pequenas decisoes de execucao e organizacao costumam melhorar muito a qualidade do treino.' },
        { title: 'Sinais de que sua dieta esta mais restritiva do que produtiva', category: 'Nutricao e Suplementacao', url: 'blog/emagrecimento.html', coverClass: 'blog-cover-weightloss', publishedAt: '2026-03-31', heroTitle: 'Sinais de que sua dieta esta mais <span class="blog-title-accent">restritiva</span> do que produtiva', heroExcerpt: 'Quando a estrategia aperta demais, a consistencia costuma cair e o processo perde forca.' },
        { title: 'O que observar quando o corpo demora para se recuperar', category: 'Saude e Bem-Estar', url: 'blog/lesoes.html', coverClass: 'blog-cover-rehab', publishedAt: '2026-03-30' },
        { title: 'Como escolher exercicios que combinam com seu objetivo', category: 'Treino e Exercicios', url: 'blog/hipertrofia.html', coverClass: 'blog-cover-hypertrophy', publishedAt: '2026-03-29' },
        { title: 'Como retomar a rotina depois de uma pausa sem se frustrar', category: 'Guias e Tutoriais', url: 'blog/emagrecimento.html', coverClass: 'blog-cover-weightloss', publishedAt: '2026-03-28' },
        { title: 'Como usar repeticoes para refinar tecnica sem perder intensidade', category: 'Dicas e Tecnicas de Treino', url: 'blog/hipertrofia.html', coverClass: 'blog-cover-hypertrophy', publishedAt: '2026-03-27' },
        { title: 'O que comer antes do treino para render mais sem exageros', category: 'Nutricao e Suplementacao', url: 'blog/emagrecimento.html', coverClass: 'blog-cover-weightloss', publishedAt: '2026-03-26' },
        { title: 'Inflamacao baixa, performance alta: por onde comecar', category: 'Saude e Bem-Estar', url: 'blog/lesoes.html', coverClass: 'blog-cover-rehab', publishedAt: '2026-03-25' }
    ];

    const recentHeroPosts = [...blogPostCatalog]
        .sort((left, right) => new Date(right.publishedAt) - new Date(left.publishedAt))
        .slice(0, 6);

    const blogHeroSlidesElement = document.querySelector('[data-blog-hero-slides]');
    const blogHeroThumbTrackElement = document.querySelector('[data-blog-hero-thumb-track]');
    const blogHeroIndicatorsElement = document.querySelector('[data-blog-hero-indicators]');

    if (blogHeroSlidesElement && blogHeroThumbTrackElement && blogHeroIndicatorsElement) {
        blogHeroSlidesElement.innerHTML = recentHeroPosts.map((post, index) => `
            <div class="carousel-item${index === 0 ? ' active' : ''}">
                <article class="blog-home-slide ${post.coverClass}">
                    <div class="blog-home-feature-content">
                        <span class="blog-tag">${post.category}</span>
                        <h1>${post.heroTitle ?? post.title}</h1>
                        <p>${post.heroExcerpt ?? post.title}</p>
                        <a href="${post.url}" class="blog-link hero-blog-link">Ler destaque <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
                    </div>
                </article>
            </div>
        `).join('');

        blogHeroThumbTrackElement.innerHTML = recentHeroPosts.map((post, index) => `
            <button type="button" class="blog-mini-thumb ${post.coverClass}${index === 0 ? ' active' : ''}" data-bs-target="#blogHeroCarousel" data-bs-slide-to="${index}" aria-label="Abrir destaque ${index + 1}" ${index === 0 ? 'aria-current="true"' : ''}></button>
        `).join('');

        blogHeroIndicatorsElement.innerHTML = recentHeroPosts.map((_, index) => `
            <button type="button" class="blog-hero-indicator${index === 0 ? ' active' : ''}" data-bs-target="#blogHeroCarousel" data-bs-slide-to="${index}" aria-label="Ir para slide ${index + 1}" ${index === 0 ? 'aria-current="true"' : ''}></button>
        `).join('');
    }

    const blogPostListElement = document.querySelector('[data-blog-post-list]');
    if (blogPostListElement) {
        const recentBlogPosts = [...blogPostCatalog]
            .sort((left, right) => new Date(right.publishedAt) - new Date(left.publishedAt))
            .slice(0, 7);

        const recentBlogPostMarkup = recentBlogPosts.map(post => `
            <a href="${post.url}" class="blog-post-row">
                <span class="blog-post-row-thumb ${post.coverClass}"></span>
                <span class="blog-post-row-copy">
                    <span class="blog-tag">${post.category}</span>
                    <strong>${post.title}</strong>
                </span>
            </a>
        `).join('');

        blogPostListElement.innerHTML = recentBlogPostMarkup;
    }

    const blogHeroCarouselElement = document.getElementById('blogHeroCarousel');
    if (blogHeroCarouselElement) {
        const blogHeroThumbWrap = blogHeroCarouselElement.querySelector('.blog-home-thumbs-wrap');
        const blogHeroThumbTrack = blogHeroCarouselElement.querySelector('[data-blog-hero-thumb-track]');
        const blogHeroIndicators = Array.from(blogHeroCarouselElement.querySelectorAll('.blog-hero-indicator'));
        const blogHeroThumbs = blogHeroThumbTrack ? Array.from(blogHeroThumbTrack.querySelectorAll('.blog-mini-thumb')) : [];
        const blogHeroThumbCount = blogHeroThumbs.length;
        let blogHeroThumbVisualIndex = blogHeroThumbCount;

        const getBlogHeroThumbOffset = visualIndex => {
            const thumbWidth = blogHeroThumbTrack?.querySelector('.blog-mini-thumb')?.offsetWidth ?? 0;
            const thumbGap = parseFloat(blogHeroThumbTrack ? window.getComputedStyle(blogHeroThumbTrack).gap : '0') || 0;
            return visualIndex * (thumbWidth + thumbGap);
        };

        const setBlogHeroThumbTrackPosition = (visualIndex, animated = true) => {
            if (!blogHeroThumbTrack) {
                return;
            }

            blogHeroThumbTrack.style.transition = animated
                ? 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)'
                : 'none';
            blogHeroThumbTrack.style.transform = `translateX(-${getBlogHeroThumbOffset(visualIndex)}px)`;
        };

        const updateBlogHeroThumbViewport = () => {
            if (!blogHeroThumbWrap || !blogHeroThumbTrack || blogHeroThumbCount === 0) {
                return;
            }

            const firstThumb = blogHeroThumbTrack.querySelector('.blog-mini-thumb');
            if (!firstThumb) {
                return;
            }

            const thumbWidth = firstThumb.offsetWidth;
            const thumbGap = parseFloat(window.getComputedStyle(blogHeroThumbTrack).gap) || 0;
            const availableWidth = blogHeroThumbWrap.clientWidth || blogHeroThumbWrap.parentElement?.clientWidth || 0;
            const visibleThumbCount = Math.min(window.innerWidth <= 576 ? 3 : 4, blogHeroThumbCount);

            blogHeroThumbWrap.style.setProperty('--blog-visible-thumbs', String(visibleThumbCount));
            setBlogHeroThumbTrackPosition(blogHeroThumbVisualIndex, false);
        };

        if (blogHeroThumbTrack && blogHeroThumbCount > 0) {
            blogHeroThumbs.forEach(thumb => {
                blogHeroThumbTrack.appendChild(thumb.cloneNode(true));
            });
            blogHeroThumbs.forEach(thumb => {
                blogHeroThumbTrack.insertBefore(thumb.cloneNode(true), blogHeroThumbTrack.firstChild);
            });
            updateBlogHeroThumbViewport();
            setBlogHeroThumbTrackPosition(blogHeroThumbVisualIndex, false);
        }

        const syncBlogHeroThumbs = activeIndex => {
            const allBlogHeroThumbs = blogHeroThumbTrack ? Array.from(blogHeroThumbTrack.querySelectorAll('.blog-mini-thumb')) : [];

            allBlogHeroThumbs.forEach(thumb => {
                const thumbIndex = Number(thumb.dataset.bsSlideTo);
                const isActive = thumbIndex === activeIndex;
                thumb.classList.toggle('active', isActive);
                thumb.setAttribute('aria-current', isActive ? 'true' : 'false');
            });

            blogHeroIndicators.forEach((indicator, index) => {
                const isActive = index === activeIndex;
                indicator.classList.toggle('active', isActive);
                indicator.setAttribute('aria-current', isActive ? 'true' : 'false');
            });
        };

        blogHeroCarouselElement.addEventListener('slid.bs.carousel', event => {
            if (blogHeroThumbCount > 0) {
                const movedNext = (event.from + 1) % blogHeroThumbCount === event.to;
                const movedPrev = (event.from - 1 + blogHeroThumbCount) % blogHeroThumbCount === event.to;

                if (movedNext) {
                    blogHeroThumbVisualIndex += 1;
                } else if (movedPrev) {
                    blogHeroThumbVisualIndex -= 1;
                } else {
                    blogHeroThumbVisualIndex = blogHeroThumbCount + event.to;
                }

                setBlogHeroThumbTrackPosition(blogHeroThumbVisualIndex, true);

                window.setTimeout(() => {
                    if (blogHeroThumbVisualIndex >= blogHeroThumbCount * 2) {
                        blogHeroThumbVisualIndex -= blogHeroThumbCount;
                        setBlogHeroThumbTrackPosition(blogHeroThumbVisualIndex, false);
                    } else if (blogHeroThumbVisualIndex < blogHeroThumbCount) {
                        blogHeroThumbVisualIndex += blogHeroThumbCount;
                        setBlogHeroThumbTrackPosition(blogHeroThumbVisualIndex, false);
                    }
                }, 560);
            }

            syncBlogHeroThumbs(event.to);
        });

        const initialIndex = blogHeroThumbs.findIndex(thumb => thumb.classList.contains('active'));
        syncBlogHeroThumbs(initialIndex >= 0 ? initialIndex : 0);
        window.addEventListener('resize', updateBlogHeroThumbViewport);
    }

    const blogFooterCarouselTrack = document.querySelector('[data-blog-carousel-track]');
    if (blogFooterCarouselTrack) {
        const blogFooterCarouselItems = Array.from(blogFooterCarouselTrack.querySelectorAll('.blog-carousel-item'));
        const blogFooterPrevButton = document.querySelector('[data-blog-carousel-nav="prev"]');
        const blogFooterNextButton = document.querySelector('[data-blog-carousel-nav="next"]');

        let blogFooterCarouselStartIndex = 0;

        const renderBlogFooterCarousel = () => {
            const rotatedItems = blogFooterCarouselItems.map((_, index) => {
                return blogFooterCarouselItems[(blogFooterCarouselStartIndex + index) % blogFooterCarouselItems.length];
            });

            blogFooterCarouselTrack.replaceChildren(...rotatedItems);
        };

        if (blogFooterCarouselItems.length > 1) {
            blogFooterPrevButton?.addEventListener('click', () => {
                blogFooterCarouselStartIndex =
                    (blogFooterCarouselStartIndex - 1 + blogFooterCarouselItems.length) % blogFooterCarouselItems.length;
                renderBlogFooterCarousel();
            });

            blogFooterNextButton?.addEventListener('click', () => {
                blogFooterCarouselStartIndex = (blogFooterCarouselStartIndex + 1) % blogFooterCarouselItems.length;
                renderBlogFooterCarousel();
            });
        }
    }

    // Calcular tempo de leitura dinamicamente (para páginas de artigo)
    const articleCopy = document.querySelector('.blog-article-copy');
    const articleTimeElement = document.querySelector('.blog-time');
    if (articleCopy && articleTimeElement) {
        const text = articleCopy.textContent || articleCopy.innerText;
        const wordCount = text.trim().split(/\s+/).length;
        const wordsPerMinute = 200;
        const readingTime = Math.ceil(wordCount / wordsPerMinute);
        articleTimeElement.innerHTML = `<i class="far fa-clock" aria-hidden="true"></i> ${readingTime} min de leitura`;
    }

});
