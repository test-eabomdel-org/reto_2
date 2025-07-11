
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

class ReviewService {
    constructor() {
        // Configuración del cliente OpenAI
        this.config = {
            token: process.env.GITHUB_TOKEN,
            endpoint: "https://models.github.ai/inference",
            model: "openai/gpt-4o"
        };
        
        this.client = new OpenAI({ 
            baseURL: this.config.endpoint, 
            apiKey: this.config.token 
        });
    }

    async processReview(prDetails, commits, changes) {
        // Implementa la lógica de revisión usando OpenAI y lineamientos
        const responseString = await this.getResponseString(prDetails, commits, changes);
        return responseString;
    }

    /**
     * Lee el contenido de un archivo Markdown
     * @param {string} mdPath - Ruta al archivo .md
     * @returns {string} - Contenido del archivo Markdown
     */
    readMarkdownFile(mdPath) {
        try {
            if (!fs.existsSync(mdPath)) {
                throw new Error(`El archivo ${mdPath} no existe`);
            }
            
            const content = fs.readFileSync(mdPath, 'utf8');
            return content;
        } catch (error) {
            throw new Error(`Error al leer el archivo Markdown: ${error.message}`);
        }
    }

    async getResponseString(prDetails, commits, changes, options = {}) {
        const defaultOptions = {
            temperature: 0.3, // Más determinístico para revisiones
            top_p: 1.0,
            model: this.config.model
        };

        const finalOptions = { ...defaultOptions, ...options };

        try {
            // Leer el contenido del archivo Markdown con lineamientos
            const guidelinesPath = path.join(__dirname, '../guidelines/node.md');
            const markdownContent = this.readMarkdownFile(guidelinesPath);

            // Construir el prompt del usuario con toda la información del PR
            const userPrompt = `
                ## PULL REQUEST PARA REVISIÓN

                ### Cambios en archivos:
                ${JSON.stringify(changes, null, 2)}

                Por favor, revisa este Pull Request siguiendo todos los lineamientos y estándares proporcionados.
            `;

            const response = await this.client.chat.completions.create({
                messages: [
                    { 
                        role: "system", 
                        content: `Eres un revisor senior de código especializado en Node.js y mejores prácticas de desarrollo. Tu tarea es revisar Pull Requests de manera exhaustiva y profesional.
                        ## LINEAMIENTOS Y ESTÁNDARES A SEGUIR:
                        ${markdownContent}

                        ## INSTRUCCIONES DE REVISIÓN:
                        1. Analiza meticulosamente el Pull Request completo (detalles, commits y cambios)
                        2. Evalúa cada aspecto contra los lineamientos proporcionados
                        3. Genera un comentario de revisión profesional y constructivo
                        4. Para cada punto evaluado, usa:
                        - ✅ Si cumple con los estándares
                        - ❌ Si NO cumple con los estándares
                        - ⚠️ Si necesita atención o mejoras menores

                        ## FORMATO DE RESPUESTA:
                        Estructura tu respuesta con las siguientes secciones:

                        ### 🎯 Conclusión:
                        [Decisión final: APROBAR ✅, RECHAZAR ❌, o SOLICITAR CAMBIOS ⚠️]

                        Sé específico, constructivo y siempre referencia los lineamientos cuando señales problemas o mejoras.` 
                    },
                    { role: "user", content: userPrompt }
                ],
                temperature: finalOptions.temperature,
                top_p: finalOptions.top_p,
                model: finalOptions.model
            });
            console.log("Respuesta del modelo:", JSON.stringify(response, null, 2));
            return response.choices[0].message.content;
        } catch (error) {
            console.error("error xd:", JSON.stringify(error, null, 2));
            console.error(`Error al revisar el Pull Request: ${error.message}`);
            // Fallback en caso de error con la API
            return "approve - Error en la revisión automática, requiere revisión manual";
        }
    }
}

module.exports = ReviewService;