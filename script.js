const amountInput = document.getElementById('amount');
const fromCurrencySelect = document.getElementById('from-currency');
const toCurrencySelect = document.getElementById('to-currency');
const convertButton = document.getElementById('convert-button');
const resultDiv = document.getElementById('result');
const errorMessageDiv = document.getElementById('error-message');
const converterForm = document.getElementById('converter-form');

const API_KEY = 'a0039d1772d347e4a7c407400f5bf7b4';
const API_BASE_URL = 'https://openexchangerates.org/api';


function displayError(message) {
    errorMessageDiv.textContent = message;
    errorMessageDiv.style.display = 'block';
    resultDiv.textContent = '';
}


function clearError() {
    errorMessageDiv.textContent = '';
    errorMessageDiv.style.display = 'none';
}


function populateCurrencyOptions(currencies) {
    fromCurrencySelect.innerHTML = '';
    toCurrencySelect.innerHTML = '';

    for (const code in currencies) {
        if (currencies.hasOwnProperty(code)) {
            const optionFrom = document.createElement('option');
            optionFrom.value = code;
            optionFrom.textContent = `${code} - ${currencies[code]}`;
            fromCurrencySelect.appendChild(optionFrom);

            const optionTo = document.createElement('option');
            optionTo.value = code;
            optionTo.textContent = `${code} - ${currencies[code]}`;
            toCurrencySelect.appendChild(optionTo);
        }
    }

    fromCurrencySelect.value = 'USD';
    toCurrencySelect.value = 'BRL';
    if (!toCurrencySelect.value) {
        toCurrencySelect.value = 'EUR';
    }
}


async function fetchCurrencies() {
    const url = `${API_BASE_URL}/currencies.json?app_id=${API_KEY}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Erro ao buscar moedas: ${response.status} ${response.statusText}. ${errorData.description || ''}`);
        }
        const currencies = await response.json();
        populateCurrencyOptions(currencies);
        clearError();
    } catch (error) {
        console.error("Falha ao buscar moedas:", error);
        displayError(`Não foi possível carregar as moedas. Verifique a conexão ou a API Key. (${error.message})`);
        amountInput.disabled = true;
        fromCurrencySelect.disabled = true;
        toCurrencySelect.disabled = true;
        if (convertButton) convertButton.disabled = true;
    }
}


async function handleConversion(event) {
    event.preventDefault();
    clearError();
    resultDiv.textContent = 'Convertendo...';

    const amount = parseFloat(amountInput.value);
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;

    if (isNaN(amount) || amount <= 0) {
        displayError('Por favor, insira um valor válido maior que zero.');
        resultDiv.textContent = '';
        return;
    }
    if (!fromCurrency || !toCurrency) {
        displayError('Por favor, selecione as moedas de origem e destino.');
        resultDiv.textContent = '';
        return;
    }

    try {
        const ratesUrl = `${API_BASE_URL}/latest.json?app_id=${API_KEY}&base=USD`;
        const response = await fetch(ratesUrl);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Erro ao buscar taxas: ${response.status} ${response.statusText}. ${errorData.description || ''}`);
        }

        const data = await response.json();
        const rates = data.rates;

        if (!rates[fromCurrency] || !rates[toCurrency]) {
             throw new Error(`Moeda(s) selecionada(s) (${fromCurrency}/${toCurrency}) não encontrada(s) nas taxas da API.`);
        }

        const amountInUsd = amount / rates[fromCurrency];
        const convertedAmount = amountInUsd * rates[toCurrency];

        resultDiv.textContent = `${amount.toLocaleString('pt-BR')} ${fromCurrency} = ${convertedAmount.toLocaleString('pt-BR', { style: 'currency', currency: toCurrency })} ${toCurrency}`;

    } catch (error) {
        console.error("Falha na conversão:", error);
        displayError(`Erro na conversão: ${error.message}`);
        resultDiv.textContent = '';
    }
}


converterForm.addEventListener('submit', handleConversion);

fetchCurrencies();