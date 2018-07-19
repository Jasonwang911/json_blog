nginx 配置文件



    gzip_buffers 4 16k;
    gzip_comp_level 2;
    #gzip_disable "MSIE [1-6]\.";

    upstream localhost {
        server 127.0.0.1:3000;
        keepalive 8;
    }

    root /usr/share/nginx/html;
    server{
          #监听的端口
            listen       80;
            server_name  www.wangshen.top;
            location / {
                #root   html;
                                  # set $flag 1;
                  
                 #}

user  nginx;
worker_processes  1;

error_log  /var/log/nginx/error.log warn;
pid        /var/run/nginx.pid;


events {
    worker_connections  1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    #sendfile        on;
    #tcp_nopush     on;

    keepalive_timeout  65;

    gzip  on;
    gzip_min_length 1k;
    gzip_buffers 4 16k;
    gzip_comp_level 2;
    gzip_types text/plain application/x-javascript text/css application/xml text/javascript application/x-httpd-php image/jpeg image/gif image/png;
    #gzip_disable "MSIE [1-6]\.";

    upstream localhost {
        server 127.0.0.1:3000;
        keepalive 8;
    }

    root /usr/share/nginx/html;
    server{
          #监听的端口
            listen       80;
            server_name  www.wangshen.top;
            location / {
                #root   html;
                #set $flag 0;

                 #if ($request_filename ~* ^.*?.(txt|doc|pdf|rar|gz|zip|docx|exe|xlsx|ppt|pptx|jpg|png)$){
                  # set $flag 1;
                   #}

                 #如果带有view说明是预览
                 #if ($request_uri ~* view$){
                     #set $flag 2;
                 #}
                 #if ($flag = 1){
                    #add_header Content-Disposition: attachment;
                 #}
                index  index.html index.htm;
                #proxy_set_header X-Real-IP $remote_addr;
                #proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                #proxy_set_header Host $http_host;
                #proxy_set_header X-NginX-Proxy true;

                #proxy_pass http://localhost/;
                #proxy_redirect off;
            }
   }

    #server{
        #listen 3000;
        #server_name node;
    #}
    #include /etc/nginx/conf.d/*.conf;


