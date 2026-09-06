// netlify/edge-functions/password-gate.ts
// Protege rutas privadas (panel-interno-3plus.html + páginas de entrega) con una sola
// contraseña compartida. No es autenticación por usuario — cualquiera con
// la contraseña entra. Suficiente para esconder contenido de acceso libre
// hoy, no para datos sensibles de verdad.

export default async (request: Request) => {
  const url = new URL(request.url);
  const cookie = request.headers.get("cookie") || "";
  const password = Deno.env.get("PROTECTED_PAGE_PASSWORD") || "";

  const hasValidSession = cookie.includes(`3plus_gate=${password}`);

  if (request.method === "POST") {
    const form = await request.formData();
    const attempt = form.get("password");
    if (attempt === password) {
      const res = new Response(null, {
        status: 302,
        headers: { Location: url.pathname },
      });
      res.headers.append(
        "Set-Cookie",
        `3plus_gate=${password}; Path=/; HttpOnly; Max-Age=86400`
      );
      return res;
    }
  }

  if (hasValidSession) {
    return; // deja pasar la petición normal
  }

  const html = `<!DOCTYPE html>
  <html lang="es"><head><meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Acceso privado — 3+ Kitchen</title>
  <style>
    body{font-family:'Hanken Grotesk',Arial,sans-serif;background:#1C1C1C;color:#F5F0E8;
      display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}
    .box{background:#241f1a;padding:32px 28px;border-radius:12px;max-width:320px;width:100%;}
    h1{font-size:16px;margin:0 0 16px;}
    input{width:100%;padding:10px 12px;border-radius:8px;border:none;margin-bottom:12px;font-size:14px;box-sizing:border-box;}
    button{width:100%;padding:10px;border-radius:8px;border:none;background:#D4A017;color:#1C1C1C;font-weight:800;cursor:pointer;}
  </style></head>
  <body>
    <div class="box">
      <h1>Esta página es privada</h1>
      <form method="POST">
        <input type="password" name="password" placeholder="Contraseña" required autofocus>
        <button type="submit">Entrar</button>
      </form>
    </div>
  </body></html>`;

  return new Response(html, {
    status: 401,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
};

export const config = {
  path: [
    "/panel-interno-3plus.html",
    "/Vol01_Tu_Estrategia_de_Cocina_Semanal.html",
    "/Vol02_Tu_Cena_Gana.html",
    "/Vol03_Parece_Que_Cocinas.html",
    "/OB01_La_Semana_Resuelta.html",
    "/OB02_Las_10_Cenas.html",
    "/OB03_El_Deck_del_Chef.html",
    "/OB-A_Salsas_y_Aderezos.html",
    "/OB-B_Ensaladas_Bases_Proteinas.html",
    "/OB-C_Lista_de_Compras_Interactiva.html",
  ],
};
