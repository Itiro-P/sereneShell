" --- Configuração de Fundo e UI ---
" Usa a superfície escura gerada para o fundo e o texto principal garantido
hi Normal       guibg=NONE guifg={{ colors.on_surface.dark.hex }}
hi NonText      guibg=NONE guifg={{ colors.outline_variant.dark.hex }}
hi CursorLine   guibg={{ colors.surface_container.dark.hex }} guifg=NONE
hi Selection    guibg={{ colors.secondary_container.dark.hex }} guifg={{ colors.on_secondary_container.dark.hex }}

" --- Sintaxe Moderna (MD3 Adaptive) ---

" Comentários: Usamos 'outline' que é um cinza com contraste testado para leitura
hi Comment      guibg=NONE guifg={{ colors.outline.dark.hex }} gui=italic

" Pontuação e Operadores: 'on_surface_variant' é perfeito para não distrair mas ser visível
hi Delimiter    guibg=NONE guifg={{ colors.on_surface_variant.dark.hex }}
hi Operator     guibg=NONE guifg={{ colors.on_surface_variant.dark.hex }}

" Identificadores (Variáveis): Primary é a cor mais forte da sua paleta
hi Identifier   guibg=NONE guifg={{ colors.primary.dark.hex }}

" Constantes e Números: O MD3 Error/Tertiary costuma ser bem vibrante
hi Constant     guibg=NONE guifg={{ colors.tertiary.dark.hex }}
hi Number       guibg=NONE guifg={{ colors.tertiary.dark.hex }}

" Tipos e Classes: Secondary traz um tom complementar
hi Type         guibg=NONE guifg={{ colors.secondary.dark.hex }}

" Strings: Usamos a 'primary' ou uma variante para dar destaque ao conteúdo
hi String       guibg=NONE guifg={{ colors.primary_fixed.dark.hex }}

" Funções: 'Inverse Primary' ou 'Secondary' garantem que o azul/ciano não suma
hi Function     guibg=NONE guifg={{ colors.inverse_primary.dark.hex }}

" Palavras-chave (Keywords): Statement/PreProc
hi Statement    guibg=NONE guifg={{ colors.error.dark.hex }}
hi PreProc      guibg=NONE guifg={{ colors.secondary.dark.hex }}
hi Special      guibg=NONE guifg={{ colors.primary.dark.hex }}

" --- Componentes de UI (Statusline/Menus) ---
hi Error        guibg={{ colors.error_container.dark.hex }} guifg={{ colors.on_error_container.dark.hex }}
hi Todo         guibg={{ colors.secondary_container.dark.hex }} guifg={{ colors.on_secondary_container.dark.hex }}
hi StatusLine   guibg={{ colors.primary.dark.hex }} guifg={{ colors.on_primary.dark.hex }}
hi StatusLineNC guibg={{ colors.surface_container_highest.dark.hex }} guifg={{ colors.on_surface_variant.dark.hex }}

" --- Pervasive (Avisos) ---
hi WarningMsg   guifg={{ colors.error.dark.hex }}
hi Search       guibg={{ colors.primary_container.dark.hex }} guifg={{ colors.on_primary_container.dark.hex }}
