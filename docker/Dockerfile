
FROM node:18 AS builder
RUN echo "deb http://deb.debian.org/debian bookworm-backports main" > /etc/apt/sources.list && \
    apt-get update && apt-get install -y  make git gzip brotli \
            libvips-dev curl make libjpeg-dev libtiff-dev libpng-dev libwebp-dev libraw-dev libheif-dev libgif-dev \
            golang-1.23
WORKDIR /home/filestash
COPY ./ ./
ENV PATH="$PATH:/usr/lib/go-1.23/bin/"
RUN npm install --legacy-peer-deps && \
    make build_init && \
    make build_frontend && \
    make build_backend && \
    mkdir -p ./dist/data/state/config/ && \
    cp config/config.json ./dist/data/state/config/config.json

FROM debian:stable-slim
MAINTAINER mickael@kerjean.me
COPY --from=builder /home/filestash/dist/ /app/
COPY server/.assets/emacs/htmlize.el /usr/share/emacs/site-list/htmlize.el
COPY server/.assets/emacs/ox-gfm.el /usr/share/emacs/site-list/ox-gfm.el
WORKDIR "/app"
RUN apt-get update && \
    apt-get install -y --no-install-recommends apt-utils && \
    apt-get install -y curl emacs-nox ffmpeg zip poppler-utils wget perl && \
    # setup the latex distro
    export CTAN_REPO="http://mirror.las.iastate.edu/tex-archive/systems/texlive/tlnet" && \
    curl -sL "https://yihui.name/gh/tinytex/tools/install-unx.sh" | sh && \
    mv ~/.TinyTeX /usr/share/tinytex && \
    /usr/share/tinytex/bin/$(uname -m)-linux/tlmgr install wasy ulem marvosym wasysym \
                                                           xcolor listings parskip \
                                                           float wrapfig sectsty capt-of \
                                                           epstopdf-pkg cm-super && \
    ln -s /usr/share/tinytex/bin/$(uname -m)-linux/pdflatex /usr/local/bin/pdflatex && \
    apt-get purge -y --auto-remove perl wget && \
    # Cleanup
    find /usr/share/ -name 'doc' | xargs rm -rf && \
    find /usr/share/emacs -name '*.pbm' | xargs rm -f && \
    find /usr/share/emacs -name '*.png' | xargs rm -f && \
    find /usr/share/emacs -name '*.xpm' | xargs rm -f

RUN useradd filestash && \
    chown -R filestash:filestash /app/ && \
    find /app/data/ -type d -exec chmod 770 {} \; && \
    find /app/data/ -type f -exec chmod 760 {} \; && \
    chmod 730 /app/filestash && \
    rm -rf /var/lib/apt/lists/* && \
    rm -rf /tmp/*

USER filestash
CMD ["/app/filestash"]
EXPOSE 8334
