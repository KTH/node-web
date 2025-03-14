FROM kthregistry.azurecr.io/kth-nodejs-22:latest
LABEL maintainer="KTH-Webb web-developers@kth.se"

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /wait
RUN chmod +x /wait

COPY ["check-_paths.js", "check-_paths.js"]
COPY ["check-_paths.json", "check-_paths.json"]

CMD ["ash", "-c", "/wait && node check-_paths.js"]
