import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const ses = new SESClient({ region: 'us-east-2' });

export const handler = async (event) => {
    // CORS headers for ALL responses
    const corsHeaders = {
        'Access-Control-Allow-Origin': 'https://treid.com.br',
        'Access-Control-Allow-Headers': 'Content-Type, Origin',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };
    
    // Log everything for debugging
    console.log('Event:', JSON.stringify(event, null, 2));
    console.log('Method:', event.httpMethod || event.requestContext?.http?.method);
    console.log('Headers:', JSON.stringify(event.headers, null, 2));
    console.log('Body:', event.body);
    
    // Handle preflight OPTIONS request FIRST - check multiple ways
    const method = event.httpMethod || event.requestContext?.http?.method;
    if (method === 'OPTIONS') {
        console.log('Handling OPTIONS request');
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }
    
    console.log('Handling POST request');
    
    try {
        // Check if body exists
        if (!event.body) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Missing request body' })
            };
        }
    
    // Parse the request body
    const body = JSON.parse(event.body);
        const { nome, email, celular, empresa, mensagem } = body;
        console.log('Parsed form data:', { nome, email, celular, empresa, mensagem });
        
        // Email parameters
        const params = {
            Destination: {
                ToAddresses: ['contato@treid.com.br']
            },
            Message: {
                Body: {
                    Html: {
                        Data: `
                            <h2>Formulário de Contato do Treid.com.br</h2>
                            <p><strong>Nome:</strong> ${nome}</p>
                            <p><strong>E-mail:</strong> ${email}</p>
                            <p><strong>Celular:</strong> ${celular}</p>
                            <p><strong>Empresa:</strong> ${empresa}</p>
                            <p><strong>Mensagem:</strong></p>
                            <p>${mensagem}</p>
                        `
                    },
                    Text: {
                        Data: `
                            Formulário de Contato do Treid.com.br
                            
                            Nome: ${nome}
                            E-mail: ${email}
                            Celular: ${celular}
                            Empresa: ${empresa}
                            Mensagem: ${mensagem}
                        `
                    }
                },
                Subject: {
                    Data: `Novo contato do site Treid - ${nome}`
                }
            },
            Source: 'contato@treid.com.br' // Must be verified in SES
        };
        
        
        console.log('SES params:', JSON.stringify(params, null, 2));
        // Send email
        const command = new SendEmailCommand(params);
        const result = await ses.send(command);
        console.log('SES result:', result);
        
        
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ message: 'Email sent successfully' })
        };
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Failed to send email' })
        };
    }
};