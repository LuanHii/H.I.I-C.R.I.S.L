# Script para substituir cores restantes do projeto - Passagem final
$replacements = @{
    'zinc-900' = 'ordem-ooze'
    'zinc-950' = 'ordem-black-deep'
    'zinc-800' = 'ordem-border'
    'zinc-700' = 'ordem-border-light'
    'zinc-600' = 'ordem-text-muted'
    'zinc-500' = 'ordem-text-muted'
    'zinc-400' = 'ordem-text-secondary'
    'zinc-300' = 'ordem-white-muted'
    'zinc-200' = 'ordem-white'
    'gray-900' = 'ordem-ooze'
    'gray-800' = 'ordem-border'
    'gray-700' = 'ordem-border-light'
    'gray-600' = 'ordem-border-light'
    'gray-500' = 'ordem-text-muted'
    'gray-400' = 'ordem-text-secondary'
    'gray-300' = 'ordem-white-muted'
}

# Encontra todos os arquivos TSX no diretório src
$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx" | Where-Object { $_.FullName -notlike "*node_modules*" }

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $originalContent = $content
    
    foreach ($key in $replacements.Keys) {
        $content = $content -replace [regex]::Escape($key), $replacements[$key]
    }
    
    if ($content -ne $originalContent) {
        [System.IO.File]::WriteAllText($file.FullName, $content)
        Write-Host "Atualizado: $($file.Name)"
    }
}

Write-Host ""
Write-Host "Passagem final de cores concluida!"
