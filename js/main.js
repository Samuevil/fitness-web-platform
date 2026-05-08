// ============================================
// SISTEMA DE CALCULADORAS - VERSÃO COMPLETA COM AUTOFORMATAÇÃO
// ALTURA SEMPRE EM METROS (ex: 1,80)
// ============================================

// ============================================
// FUNÇÕES AUXILIARES DE FORMATAÇÃO
// ============================================

// Converte peso digitado (ex: 705 → 70.5)
function parsePesoValue(input) {
    if (!input) return NaN;
    let str = String(input).replace(/[^0-9]/g, '');
    if (str === '') return NaN;
    let num = parseInt(str, 10);
    if (str.length >= 3) return num / 10;
    return num;
}

// Converte altura digitada (SEMPRE EM METROS)
// Ex: 180 → 1,80 | 175 → 1,75 | 170 → 1,70
function parseAlturaValue(input) {
    if (!input) return NaN;
    let str = String(input).replace(/[^0-9]/g, '');
    if (str === '') return NaN;
    let num = parseInt(str, 10);
    // Qualquer número digitado é tratado como centímetros e convertido para metros
    return num / 100;
}

// Converte número inteiro (ex: 30 → 30)
function parseIntValue(input) {
    if (!input) return NaN;
    let str = String(input).replace(/[^0-9]/g, '');
    if (str === '') return NaN;
    return parseInt(str, 10);
}

// Formata peso para exibição (ex: 70.5 → 70,5)
function formatPesoDisplay(value) {
    if (isNaN(value)) return '';
    if (value % 1 === 0) return value.toString();
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

// Formata altura para exibição (ex: 1.8 → 1,80)
function formatAlturaDisplay(value) {
    if (isNaN(value)) return '';
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ============================================
// CONFIGURAÇÃO DOS INPUTS COM AUTOFORMATAÇÃO
// ============================================
function setupAutoFormatInputs() {
    // Inputs de peso
    document.querySelectorAll('.auto-peso').forEach(input => {
        input.addEventListener('input', function(e) {
            let raw = this.value.replace(/[^0-9]/g, '');
            if (raw === '') {
                this.value = '';
                return;
            }
            let num = parseInt(raw, 10);
            if (raw.length >= 3) {
                let inteiro = Math.floor(num / 10);
                let decimal = num % 10;
                this.value = `${inteiro},${decimal}`;
            } else {
                this.value = num.toString();
            }
        });
    });
    
    // Inputs de altura (SEMPRE EM METROS)
    // Digite 180 → 1,80 | 175 → 1,75
    document.querySelectorAll('.auto-altura').forEach(input => {
        input.addEventListener('input', function(e) {
            let raw = this.value.replace(/[^0-9]/g, '');
            if (raw === '') {
                this.value = '';
                return;
            }
            let num = parseInt(raw, 10);
            let metros = Math.floor(num / 100);
            let centimetros = num % 100;
            this.value = `${metros},${centimetros.toString().padStart(2, '0')}`;
        });
    });
    
    // Inputs de inteiros (idade, cintura, etc.)
    document.querySelectorAll('.auto-int').forEach(input => {
        input.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    });
}

// ============================================
// SISTEMA DE CALCULADORAS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, once: true, offset: 100 });
    }
    
    loadRecentBlogPosts();

    // Modal
    const modalElement = document.getElementById('calculatorModal');
    let modalInstance = null;
    if (modalElement) modalInstance = new bootstrap.Modal(modalElement);
    
    // Botões das calculadoras
    document.querySelectorAll('.tool-trigger').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const calculatorType = this.getAttribute('data-calculator');
            if (calculatorType && modalInstance) {
                loadCalculator(calculatorType);
                modalInstance.show();
            }
        });
    });
    
    function loadCalculator(type) {
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        if (!modalTitle || !modalBody) return;
        
        switch(type) {
            case 'imc':
                modalTitle.textContent = 'Calculadora de IMC';
                modalBody.innerHTML = getIMCCalculatorHTML();
                attachIMCEvent();
                setupAutoFormatInputs();
                break;
            case 'bodyfat':
                modalTitle.textContent = 'Calculadora de % de Gordura';
                modalBody.innerHTML = getBodyFatCalculatorHTML();
                attachBodyFatEvent();
                setupAutoFormatInputs();
                break;
            case 'tmb':
                modalTitle.textContent = 'Taxa Metabólica Basal (TMB)';
                modalBody.innerHTML = getTMBCalculatorHTML();
                attachTMBEvent();
                setupAutoFormatInputs();
                break;
            case 'tdee':
                modalTitle.textContent = 'Gasto Calórico Diário (TDEE)';
                modalBody.innerHTML = getTDEECalculatorHTML();
                attachTDEEEvent();
                setupAutoFormatInputs();
                break;
            case 'macros':
                modalTitle.textContent = 'Distribuição de Macronutrientes';
                modalBody.innerHTML = getMacrosCalculatorHTML();
                attachMacrosEvent();
                setupAutoFormatInputs();
                break;
            case 'proteina':
                modalTitle.textContent = 'Calculadora de Proteína Diária';
                modalBody.innerHTML = getProteinaCalculatorHTML();
                attachProteinaEvent();
                setupAutoFormatInputs();
                break;
            default:
                modalBody.innerHTML = '<p class="text-muted">Calculadora não encontrada.</p>';
        }
    }
    
    // ============================================
    // CARREGAR POSTS DO BLOG
    // ============================================
    async function loadRecentBlogPosts() {
        const container = document.getElementById('blogHomePostsContainer');
        if (!container) return;
        
        try {
            const response = await fetch('blog/posts-data.json?t=' + Date.now());
            const data = await response.json();
            const posts = data.posts || [];
            const postsRecentes = [...posts].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)).slice(0, 6);
            
            if (postsRecentes.length === 0) {
                container.innerHTML = '<div class="col-12 text-center py-5">Nenhum post disponível no momento.</div>';
                return;
            }
            
            let html = '';
            postsRecentes.forEach((post) => {
                html += `
                    <div class="col-md-6 col-lg-4">
                        <a href="blog/post.html?id=${post.id}" class="home-blog-card">
                            <div class="home-blog-image" style="background-image: url('${post.coverImage || 'img/background.jpg'}');">
                                <span class="home-blog-tag">${escapeHtml(post.category)}</span>
                            </div>
                            <div class="home-blog-content">
                                <h3>${escapeHtml(post.title)}</h3>
                                <p>${post.summary ? escapeHtml(post.summary.substring(0, 100)) + '...' : 'Clique para ler o artigo completo.'}</p>
                                <div class="home-blog-link">
                                    Ler artigo <i class="fas fa-arrow-right" aria-hidden="true"></i>
                                </div>
                            </div>
                        </a>
                    </div>
                `;
            });
            container.innerHTML = html;
        } catch (error) {
            console.error('Erro ao carregar posts do blog:', error);
            container.innerHTML = '<div class="col-12 text-center py-5">Não foi possível carregar os posts do blog.</div>';
        }
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // ============================================
    // CALCULADORA IMC
    // ============================================
    function getIMCCalculatorHTML() {
        return `
            <div class="calculator-input">
                <label for="imcPeso">Peso (kg)</label>
                <input type="text" id="imcPeso" class="form-control auto-peso" placeholder="Digite: 705 = 70,5kg" inputmode="numeric">
                <small class="text-muted">Digite apenas números: 705 = 70,5kg | 70 = 70kg</small>
            </div>
            <div class="calculator-input">
                <label for="imcAltura">Altura (m)</label>
                <input type="text" id="imcAltura" class="form-control auto-altura" placeholder="Digite: 180 = 1,80m" inputmode="numeric">
                <small class="text-muted">Digite apenas números: 180 = 1,80m | 175 = 1,75m | 170 = 1,70m</small>
            </div>
            <button id="calcularImc" class="btn btn-primary-custom w-100 mt-3">Calcular IMC</button>
            <div id="imcResultado" class="result-box mt-3" style="display: none;">
                <div class="result-value" id="imcValor"></div>
                <p id="imcClassificacao"></p>
                <small class="text-muted">IMC entre 18.5 e 24.9 é considerado saudável.</small>
            </div>
        `;
    }
    
    function attachIMCEvent() {
        document.getElementById('calcularImc')?.addEventListener('click', function() {
            const pesoRaw = document.getElementById('imcPeso')?.value || '';
            const alturaRaw = document.getElementById('imcAltura')?.value || '';
            
            let peso = parsePesoValue(pesoRaw);
            let altura = parseAlturaValue(alturaRaw);
            
            if (isNaN(peso) || isNaN(altura) || peso <= 0 || altura <= 0) {
                alert('Por favor, insira valores válidos.\n\nExemplos:\nPeso: 705 = 70,5kg\nAltura: 180 = 1,80m');
                return;
            }
            
            const imc = peso / (altura * altura);
            let classificacao = '';
            if (imc < 18.5) classificacao = 'Abaixo do peso';
            else if (imc < 25) classificacao = 'Peso normal';
            else if (imc < 30) classificacao = 'Sobrepeso';
            else if (imc < 35) classificacao = 'Obesidade grau I';
            else if (imc < 40) classificacao = 'Obesidade grau II';
            else classificacao = 'Obesidade grau III';
            
            const resultadoDiv = document.getElementById('imcResultado');
            const imcValor = document.getElementById('imcValor');
            const imcClassificacao = document.getElementById('imcClassificacao');
            
            if (resultadoDiv && imcValor && imcClassificacao) {
                imcValor.textContent = imc.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
                imcClassificacao.textContent = `Classificação: ${classificacao}`;
                resultadoDiv.style.display = 'block';
            }
        });
    }
    
    // ============================================
    // CALCULADORA % GORDURA
    // ============================================
    function getBodyFatCalculatorHTML() {
        return `
            <div class="calculator-input">
                <label for="fatSexo">Sexo</label>
                <select id="fatSexo" class="form-control">
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                </select>
            </div>
            <div class="calculator-input">
                <label for="fatIdade">Idade (anos)</label>
                <input type="text" id="fatIdade" class="form-control auto-int" placeholder="Digite: 30" inputmode="numeric">
            </div>
            <div class="calculator-input">
                <label for="fatPeso">Peso (kg)</label>
                <input type="text" id="fatPeso" class="form-control auto-peso" placeholder="Digite: 705 = 70,5kg" inputmode="numeric">
            </div>
            <div class="calculator-input">
                <label for="fatAltura">Altura (m)</label>
                <input type="text" id="fatAltura" class="form-control auto-altura" placeholder="Digite: 180 = 1,80m" inputmode="numeric">
                <small class="text-muted">Digite 180 = 1,80m | 175 = 1,75m</small>
            </div>
            <div class="calculator-input">
                <label for="fatCintura">Circunferência da cintura (cm)</label>
                <input type="text" id="fatCintura" class="form-control auto-int" placeholder="Digite: 80 = 80cm" inputmode="numeric">
            </div>
            <div class="calculator-input">
                <label for="fatPescoco">Circunferência do pescoço (cm)</label>
                <input type="text" id="fatPescoco" class="form-control auto-int" placeholder="Digite: 38 = 38cm" inputmode="numeric">
            </div>
            <div class="calculator-input" id="fatQuadrilGroup">
                <label for="fatQuadril">Circunferência do quadril (cm)</label>
                <input type="text" id="fatQuadril" class="form-control auto-int" placeholder="Digite: 90 = 90cm" inputmode="numeric">
            </div>
            <button id="calcularBodyFat" class="btn btn-primary-custom w-100 mt-3">Calcular % Gordura</button>
            <div id="bodyFatResultado" class="result-box mt-3" style="display: none;">
                <div class="result-value" id="bodyFatValor"></div>
                <p id="bodyFatClassificacao"></p>
                <small class="text-muted">* Estimativa aproximada. Avaliação profissional é mais precisa.</small>
            </div>
        `;
    }
    
    function attachBodyFatEvent() {
        const sexoSelect = document.getElementById('fatSexo');
        const quadrilGroup = document.getElementById('fatQuadrilGroup');
        
        if (sexoSelect && quadrilGroup) {
            sexoSelect.addEventListener('change', function() {
                quadrilGroup.style.display = this.value === 'feminino' ? 'block' : 'none';
            });
            quadrilGroup.style.display = sexoSelect.value === 'feminino' ? 'block' : 'none';
        }
        
        document.getElementById('calcularBodyFat')?.addEventListener('click', function() {
            const sexo = document.getElementById('fatSexo')?.value;
            const idade = parseIntValue(document.getElementById('fatIdade')?.value);
            const peso = parsePesoValue(document.getElementById('fatPeso')?.value);
            const alturaCm = parseAlturaValue(document.getElementById('fatAltura')?.value) * 100; // Converte metros para cm
            const cintura = parseIntValue(document.getElementById('fatCintura')?.value);
            const pescoco = parseIntValue(document.getElementById('fatPescoco')?.value);
            const quadril = parseIntValue(document.getElementById('fatQuadril')?.value);
            
            if (isNaN(peso) || isNaN(alturaCm) || isNaN(cintura) || isNaN(pescoco) || isNaN(idade)) {
                alert('Por favor, preencha todos os campos obrigatórios com valores válidos.\n\nAltura: digite 180 = 1,80m');
                return;
            }
            
            let bodyFat = 0;
            let classificacao = '';
            
            if (sexo === 'masculino') {
                bodyFat = 86.010 * Math.log10(cintura - pescoco) - 70.041 * Math.log10(alturaCm) + 36.76;
                bodyFat = Math.min(Math.max(bodyFat, 5), 40);
                if (bodyFat < 10) classificacao = 'Essencial (atleta)';
                else if (bodyFat < 15) classificacao = 'Abaixo da média';
                else if (bodyFat < 20) classificacao = 'Saudável';
                else if (bodyFat < 25) classificacao = 'Acima da média';
                else classificacao = 'Elevado';
            } else {
                if (isNaN(quadril)) {
                    alert('Por favor, informe a circunferência do quadril.');
                    return;
                }
                bodyFat = 163.205 * Math.log10(cintura + quadril - pescoco) - 97.684 * Math.log10(alturaCm) - 78.387;
                bodyFat = Math.min(Math.max(bodyFat, 10), 45);
                if (bodyFat < 18) classificacao = 'Essencial (atleta)';
                else if (bodyFat < 23) classificacao = 'Abaixo da média';
                else if (bodyFat < 28) classificacao = 'Saudável';
                else if (bodyFat < 33) classificacao = 'Acima da média';
                else classificacao = 'Elevado';
            }
            
            const resultadoDiv = document.getElementById('bodyFatResultado');
            const bodyFatValor = document.getElementById('bodyFatValor');
            const bodyFatClassificacao = document.getElementById('bodyFatClassificacao');
            
            if (resultadoDiv && bodyFatValor && bodyFatClassificacao) {
                bodyFatValor.textContent = bodyFat.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';
                bodyFatClassificacao.textContent = `Classificação: ${classificacao}`;
                resultadoDiv.style.display = 'block';
            }
        });
    }
    
    // ============================================
    // CALCULADORA TMB
    // ============================================
    function getTMBCalculatorHTML() {
        return `
            <div class="calculator-input">
                <label for="tmbSexo">Sexo</label>
                <select id="tmbSexo" class="form-control">
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                </select>
            </div>
            <div class="calculator-input">
                <label for="tmbIdade">Idade (anos)</label>
                <input type="text" id="tmbIdade" class="form-control auto-int" placeholder="Digite: 30" inputmode="numeric">
            </div>
            <div class="calculator-input">
                <label for="tmbPeso">Peso (kg)</label>
                <input type="text" id="tmbPeso" class="form-control auto-peso" placeholder="Digite: 705 = 70,5kg" inputmode="numeric">
            </div>
            <div class="calculator-input">
                <label for="tmbAltura">Altura (m)</label>
                <input type="text" id="tmbAltura" class="form-control auto-altura" placeholder="Digite: 180 = 1,80m" inputmode="numeric">
                <small class="text-muted">Digite 180 = 1,80m | 175 = 1,75m</small>
            </div>
            <button id="calcularTMB" class="btn btn-primary-custom w-100 mt-3">Calcular TMB</button>
            <div id="tmbResultado" class="result-box mt-3" style="display: none;">
                <div class="result-value" id="tmbValor"></div>
                <p id="tmbExplicacao">Calorias que seu corpo gasta em repouso por dia</p>
                <small class="text-muted">Fórmula de Mifflin-St Jeor (mais precisa)</small>
            </div>
        `;
    }
    
    function attachTMBEvent() {
        document.getElementById('calcularTMB')?.addEventListener('click', function() {
            const sexo = document.getElementById('tmbSexo')?.value;
            const idade = parseIntValue(document.getElementById('tmbIdade')?.value);
            const peso = parsePesoValue(document.getElementById('tmbPeso')?.value);
            const alturaCm = parseAlturaValue(document.getElementById('tmbAltura')?.value) * 100; // Converte metros para cm
            
            if (isNaN(idade) || isNaN(peso) || isNaN(alturaCm) || idade <= 0 || peso <= 0 || alturaCm <= 0) {
                alert('Por favor, preencha todos os campos com valores válidos.\n\nAltura: digite 180 = 1,80m');
                return;
            }
            
            let tmb = 0;
            if (sexo === 'masculino') tmb = (10 * peso) + (6.25 * alturaCm) - (5 * idade) + 5;
            else tmb = (10 * peso) + (6.25 * alturaCm) - (5 * idade) - 161;
            
            const resultadoDiv = document.getElementById('tmbResultado');
            const tmbValor = document.getElementById('tmbValor');
            
            if (resultadoDiv && tmbValor) {
                tmbValor.textContent = Math.round(tmb) + ' kcal/dia';
                resultadoDiv.style.display = 'block';
            }
        });
    }
    
    // ============================================
    // CALCULADORA TDEE
    // ============================================
    function getTDEECalculatorHTML() {
        return `
            <div class="calculator-input">
                <label for="tdeeSexo">Sexo</label>
                <select id="tdeeSexo" class="form-control">
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                </select>
            </div>
            <div class="calculator-input">
                <label for="tdeeIdade">Idade (anos)</label>
                <input type="text" id="tdeeIdade" class="form-control auto-int" placeholder="Digite: 30" inputmode="numeric">
            </div>
            <div class="calculator-input">
                <label for="tdeePeso">Peso (kg)</label>
                <input type="text" id="tdeePeso" class="form-control auto-peso" placeholder="Digite: 705 = 70,5kg" inputmode="numeric">
            </div>
            <div class="calculator-input">
                <label for="tdeeAltura">Altura (m)</label>
                <input type="text" id="tdeeAltura" class="form-control auto-altura" placeholder="Digite: 180 = 1,80m" inputmode="numeric">
                <small class="text-muted">Digite 180 = 1,80m | 175 = 1,75m</small>
            </div>
            <div class="calculator-input">
                <label for="tdeeAtividade">Nível de Atividade</label>
                <select id="tdeeAtividade" class="form-control">
                    <option value="1.2">Sedentário (pouco ou nenhum exercício)</option>
                    <option value="1.375">Leve (exercício 1-3 dias/semana)</option>
                    <option value="1.55">Moderado (exercício 3-5 dias/semana)</option>
                    <option value="1.725">Ativo (exercício 6-7 dias/semana)</option>
                    <option value="1.9">Muito ativo (exercício 2x/dia)</option>
                </select>
            </div>
            <div class="calculator-input">
                <label for="tdeeObjetivo">Objetivo</label>
                <select id="tdeeObjetivo" class="form-control">
                    <option value="manter">Manter peso</option>
                    <option value="perder">Perder peso (déficit de 500kcal)</option>
                    <option value="ganhar">Ganhar peso (superávit de 500kcal)</option>
                </select>
            </div>
            <button id="calcularTDEE" class="btn btn-primary-custom w-100 mt-3">Calcular Gasto Calórico</button>
            <div id="tdeeResultado" class="result-box mt-3" style="display: none;">
                <div class="result-value" id="tdeeValor"></div>
                <p id="tdeeRecomendacao"></p>
                <small class="text-muted">* Para emagrecimento saudável, déficit de 300-500 kcal/dia.</small>
            </div>
        `;
    }
    
    function attachTDEEEvent() {
        document.getElementById('calcularTDEE')?.addEventListener('click', function() {
            const sexo = document.getElementById('tdeeSexo')?.value;
            const idade = parseIntValue(document.getElementById('tdeeIdade')?.value);
            const peso = parsePesoValue(document.getElementById('tdeePeso')?.value);
            const alturaCm = parseAlturaValue(document.getElementById('tdeeAltura')?.value) * 100;
            const atividade = parseFloat(document.getElementById('tdeeAtividade')?.value);
            const objetivo = document.getElementById('tdeeObjetivo')?.value;
            
            if (isNaN(idade) || isNaN(peso) || isNaN(alturaCm) || idade <= 0 || peso <= 0 || alturaCm <= 0) {
                alert('Por favor, preencha todos os campos com valores válidos.\n\nAltura: digite 180 = 1,80m');
                return;
            }
            
            let tmb = 0;
            if (sexo === 'masculino') tmb = (10 * peso) + (6.25 * alturaCm) - (5 * idade) + 5;
            else tmb = (10 * peso) + (6.25 * alturaCm) - (5 * idade) - 161;
            
            let tdee = tmb * atividade;
            let recomendacao = '';
            let caloriasFinal = tdee;
            
            if (objetivo === 'perder') {
                caloriasFinal = tdee - 500;
                recomendacao = `Para perder peso de forma saudável: ~${Math.round(caloriasFinal)} kcal/dia`;
            } else if (objetivo === 'ganhar') {
                caloriasFinal = tdee + 500;
                recomendacao = `Para ganhar peso/massa muscular: ~${Math.round(caloriasFinal)} kcal/dia`;
            } else {
                recomendacao = `Para manter seu peso atual: ~${Math.round(caloriasFinal)} kcal/dia`;
            }
            
            const resultadoDiv = document.getElementById('tdeeResultado');
            const tdeeValor = document.getElementById('tdeeValor');
            const tdeeRecomendacao = document.getElementById('tdeeRecomendacao');
            
            if (resultadoDiv && tdeeValor && tdeeRecomendacao) {
                tdeeValor.textContent = Math.round(tdee) + ' kcal/dia';
                tdeeRecomendacao.textContent = recomendacao;
                resultadoDiv.style.display = 'block';
            }
        });
    }
    
    // ============================================
    // CALCULADORA DE MACRONUTRIENTES
    // ============================================
    function getMacrosCalculatorHTML() {
        return `
            <div class="calculator-input">
                <label for="macrosPeso">Peso (kg)</label>
                <input type="text" id="macrosPeso" class="form-control auto-peso" placeholder="Digite: 705 = 70,5kg" inputmode="numeric">
                <small class="text-muted">Digite apenas números: 705 = 70,5kg | 70 = 70kg</small>
            </div>
            <div class="calculator-input">
                <label for="macrosObjetivo">Objetivo</label>
                <select id="macrosObjetivo" class="form-control">
                    <option value="perder">Perder peso</option>
                    <option value="manter">Manter peso</option>
                    <option value="ganhar">Ganhar massa muscular</option>
                </select>
            </div>
            <div class="calculator-input">
                <label for="macrosNivel">Nível de Atividade</label>
                <select id="macrosNivel" class="form-control">
                    <option value="1.2">Sedentário</option>
                    <option value="1.375">Leve</option>
                    <option value="1.55">Moderado</option>
                    <option value="1.725">Ativo</option>
                    <option value="1.9">Muito ativo</option>
                </select>
            </div>
            <button id="calcularMacros" class="btn btn-primary-custom w-100 mt-3">Calcular Macronutrientes</button>
            <div id="macrosResultado" class="result-box mt-3" style="display: none;">
                <div class="result-value" id="macrosValor"></div>
                <p id="macrosDetalhe"></p>
                <small class="text-muted">Baseado em 2.2g/kg de proteína, 1g/kg de gordura, resto carboidratos.</small>
            </div>
        `;
    }
    
    function attachMacrosEvent() {
        document.getElementById('calcularMacros')?.addEventListener('click', function() {
            const peso = parsePesoValue(document.getElementById('macrosPeso')?.value);
            const objetivo = document.getElementById('macrosObjetivo')?.value;
            
            if (isNaN(peso) || peso <= 0) {
                alert('Por favor, insira um peso válido.\n\nPeso: digite 705 para 70,5kg');
                return;
            }
            
            let proteina = 0, gordura = 0;
            switch(objetivo) {
                case 'perder': proteina = 2.2 * peso; gordura = 0.8 * peso; break;
                case 'manter': proteina = 1.8 * peso; gordura = 1 * peso; break;
                case 'ganhar': proteina = 2.2 * peso; gordura = 1.2 * peso; break;
            }
            
            let carboidrato = 0, caloriasTotal = 0;
            if (objetivo === 'perder') {
                caloriasTotal = peso * 26;
                carboidrato = Math.max(0, (caloriasTotal - (proteina * 4 + gordura * 9)) / 4);
            } else if (objetivo === 'manter') {
                caloriasTotal = peso * 30;
                carboidrato = Math.max(0, (caloriasTotal - (proteina * 4 + gordura * 9)) / 4);
            } else {
                caloriasTotal = peso * 35;
                carboidrato = Math.max(0, (caloriasTotal - (proteina * 4 + gordura * 9)) / 4);
            }
            
            const resultadoDiv = document.getElementById('macrosResultado');
            const macrosValor = document.getElementById('macrosValor');
            const macrosDetalhe = document.getElementById('macrosDetalhe');
            
            if (resultadoDiv && macrosValor && macrosDetalhe) {
                macrosValor.textContent = `${Math.round(caloriasTotal)} kcal/dia`;
                macrosDetalhe.innerHTML = `
                    Proteínas: ${Math.round(proteina)}g (${Math.round(proteina * 4)} kcal)<br>
                    Carboidratos: ${Math.round(carboidrato)}g (${Math.round(carboidrato * 4)} kcal)<br>
                    Gorduras: ${Math.round(gordura)}g (${Math.round(gordura * 9)} kcal)
                `;
                resultadoDiv.style.display = 'block';
            }
        });
    }
    
    // ============================================
    // CALCULADORA DE PROTEÍNA DIÁRIA
    // ============================================
    function getProteinaCalculatorHTML() {
        return `
            <div class="calculator-input">
                <label for="protPeso">Peso (kg)</label>
                <input type="text" id="protPeso" class="form-control auto-peso" placeholder="Digite: 705 = 70,5kg" inputmode="numeric">
                <small class="text-muted">Digite apenas números: 705 = 70,5kg | 70 = 70kg</small>
            </div>
            <div class="calculator-input">
                <label for="protNivel">Nível de Atividade</label>
                <select id="protNivel" class="form-control">
                    <option value="sedentario">Sedentário (1.0-1.2g/kg)</option>
                    <option value="leve">Leve (1.2-1.5g/kg)</option>
                    <option value="moderado">Moderado (1.5-1.8g/kg)</option>
                    <option value="ativo">Ativo/Esportista (2.0-2.2g/kg)</option>
                    <option value="hipertrofia">Hipertrofia (2.2-2.5g/kg)</option>
                </select>
            </div>
            <button id="calcularProteina" class="btn btn-primary-custom w-100 mt-3">Calcular Proteína</button>
            <div id="proteinaResultado" class="result-box mt-3" style="display: none;">
                <div class="result-value" id="proteinaValor"></div>
                <p id="proteinaRange"></p>
                <small class="text-muted">Distribua a proteína em 3-5 refeições ao longo do dia.</small>
            </div>
        `;
    }
    
    function attachProteinaEvent() {
        document.getElementById('calcularProteina')?.addEventListener('click', function() {
            const peso = parsePesoValue(document.getElementById('protPeso')?.value);
            const nivel = document.getElementById('protNivel')?.value;
            
            if (isNaN(peso) || peso <= 0) {
                alert('Por favor, insira um peso válido.\n\nPeso: digite 705 para 70,5kg');
                return;
            }
            
            let proteinaMin = 0, proteinaMax = 0, textoNivel = '';
            switch(nivel) {
                case 'sedentario': proteinaMin = 1.0; proteinaMax = 1.2; textoNivel = 'Sedentário'; break;
                case 'leve': proteinaMin = 1.2; proteinaMax = 1.5; textoNivel = 'Atividade leve'; break;
                case 'moderado': proteinaMin = 1.5; proteinaMax = 1.8; textoNivel = 'Atividade moderada'; break;
                case 'ativo': proteinaMin = 2.0; proteinaMax = 2.2; textoNivel = 'Ativo/Esportista'; break;
                case 'hipertrofia': proteinaMin = 2.2; proteinaMax = 2.5; textoNivel = 'Hipertrofia'; break;
            }
            
            const minGramas = proteinaMin * peso;
            const maxGramas = proteinaMax * peso;
            
            const resultadoDiv = document.getElementById('proteinaResultado');
            const proteinaValor = document.getElementById('proteinaValor');
            const proteinaRange = document.getElementById('proteinaRange');
            
            if (resultadoDiv && proteinaValor && proteinaRange) {
                proteinaValor.textContent = `${Math.round(minGramas)} - ${Math.round(maxGramas)} gramas/dia`;
                proteinaRange.textContent = `Recomendação para ${textoNivel}: ${Math.round(minGramas)} a ${Math.round(maxGramas)}g de proteína por dia`;
                resultadoDiv.style.display = 'block';
            }
        });
    }
    
    // ============================================
    // NAVBAR SCROLL EFFECT
    // ============================================
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 50));
    }

    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.getElementById('navbarNav');
    if (navbarToggler && navbarCollapse) {
        document.addEventListener('click', function(e) {
            const clickedInsideMenu = navbarCollapse.contains(e.target);
            const clickedToggler = navbarToggler.contains(e.target);
            const isMenuOpen = navbarCollapse.classList.contains('show');

            if (!isMenuOpen || clickedInsideMenu || clickedToggler) return;

            bootstrap.Collapse.getOrCreateInstance(navbarCollapse).hide();
        });
    }
    
    // ============================================
    // SMOOTH SCROLL
    // ============================================
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const offset = 80;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });
});
