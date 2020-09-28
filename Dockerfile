FROM linuxserver/code-server

COPY /31-config /etc/cont-init.d/31-config

EXPOSE 8443
