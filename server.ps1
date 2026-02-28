$port = if ($env:PORT) { $env:PORT } else { '8080' }
Write-Host "Server running on http://localhost:$port"
[Console]::Out.Flush()
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://+:${port}/")
$listener.Start()
$root = 'C:\Users\PPC\Downloads\test'
while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $path = $ctx.Request.Url.LocalPath
    if ($path -eq '/') { $path = '/index.html' }
    $file = Join-Path $root $path.TrimStart('/')
    if (Test-Path $file -PathType Leaf) {
        $bytes = [System.IO.File]::ReadAllBytes($file)
        $ctx.Response.ContentType = 'text/html; charset=utf-8'
        $ctx.Response.ContentLength64 = $bytes.Length
        $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $ctx.Response.StatusCode = 404
    }
    $ctx.Response.Close()
}
