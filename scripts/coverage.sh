#!/bin/bash

# Script para gerar relatórios de cobertura equivalentes ao JaCoCo
# Este script gera relatórios em múltiplos formatos para integração com ferramentas de CI/CD

echo "🔍 Iniciando análise de cobertura de código..."

# Limpar cobertura anterior
echo "🧹 Limpando cobertura anterior..."
rm -rf coverage/
rm -f coverage.lcov

# Executar testes com cobertura
echo "🧪 Executando testes com cobertura..."
npm run test:coverage

# Verificar se os testes passaram
if [ $? -ne 0 ]; then
    echo "❌ Testes falharam. Abortando geração de relatórios."
    exit 1
fi

echo "✅ Testes executados com sucesso!"

# Gerar relatório LCOV (compatível com JaCoCo)
echo "📊 Gerando relatório LCOV..."
if [ -f "coverage/lcov.info" ]; then
    echo "📈 Relatório LCOV gerado em coverage/lcov.info"
    
    # Estatísticas de cobertura
    echo "📊 Estatísticas de cobertura:"
    cat coverage/lcov.info | grep -E "^SF:|^LF:|^LH:|^BRF:|^BRH:" | head -5
    
    # Cobertura total
    TOTAL_LINES=$(cat coverage/lcov.info | grep "^LF:" | awk -F: '{sum += $2} END {print sum}')
    HIT_LINES=$(cat coverage/lcov.info | grep "^LH:" | awk -F: '{sum += $2} END {print sum}')
    
    if [ "$TOTAL_LINES" -gt 0 ]; then
        COVERAGE_PERCENT=$((HIT_LINES * 100 / TOTAL_LINES))
        echo "🎯 Cobertura total: $HIT_LINES/$TOTAL_LINES linhas ($COVERAGE_PERCENT%)"
    fi
else
    echo "⚠️  Relatório LCOV não encontrado"
fi

# Gerar relatório HTML
echo "🌐 Gerando relatório HTML..."
if [ -d "coverage/lcov-report" ]; then
    echo "📁 Relatório HTML disponível em coverage/lcov-report/index.html"
else
    echo "⚠️  Relatório HTML não encontrado"
fi

# Gerar relatório Cobertura (formato XML)
echo "📄 Gerando relatório Cobertura XML..."
if [ -f "coverage/cobertura-coverage.xml" ]; then
    echo "📋 Relatório Cobertura XML gerado em coverage/cobertura-coverage.xml"
else
    echo "⚠️  Relatório Cobertura XML não encontrado"
fi

# Verificar thresholds de cobertura
echo "🎯 Verificando thresholds de cobertura..."
COVERAGE_THRESHOLD=70

if [ "$COVERAGE_PERCENT" -lt "$COVERAGE_THRESHOLD" ]; then
    echo "❌ Cobertura ($COVERAGE_PERCENT%) está abaixo do threshold ($COVERAGE_THRESHOLD%)"
    echo "💡 Considere adicionar mais testes para aumentar a cobertura"
    exit 1
else
    echo "✅ Cobertura ($COVERAGE_PERCENT%) está acima do threshold ($COVERAGE_THRESHOLD%)"
fi

echo "🎉 Análise de cobertura concluída com sucesso!"
echo ""
echo "📁 Relatórios disponíveis:"
echo "   - LCOV: coverage/lcov.info (para integração com CI/CD)"
echo "   - HTML: coverage/lcov-report/index.html (para visualização)"
echo "   - XML: coverage/cobertura-coverage.xml (para ferramentas externas)"
echo "   - JSON: coverage/coverage-final.json (para análise programática)"
