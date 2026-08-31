FROM nginx:alpine
LABEL maintainer="CarePlus Engineering"
LABEL description="CarePlus Healthcare Portal static frontend"
COPY index.html /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY assets /usr/share/nginx/html/assets
COPY README.md /usr/share/nginx/html/
RUN echo "ok" > /usr/share/nginx/html/health
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
