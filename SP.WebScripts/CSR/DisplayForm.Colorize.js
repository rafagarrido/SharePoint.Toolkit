SP.SOD.executeFunc('clienttemplates.js', 'SPClientTemplates', function () {
    (function () {
        var overrideCtx = {};
        overrideCtx.Templates = {};

        overrideCtx.Templates.Fields = {
            'Color': {
                'View': colorFieldRenderer
            }
        };

        SPClientTemplates.TemplateManager.RegisterTemplateOverrides(overrideCtx);

        function colorFieldRenderer(ctx) {
            var color = ctx.CurrentItem[ctx.CurrentFieldSchema.Name];

            var colorMap = {
                'Rojo': '#ffcccc',
                'Verde': '#ccffcc',
                'Azul': '#cce5ff'
            };

            var bgColor = colorMap[color] || '#f0f0f0';

            return "<div style='padding:5px; font-weight:bold; background-color:" + bgColor + ";'>" + color + "</div>";
        }
    })();
});

