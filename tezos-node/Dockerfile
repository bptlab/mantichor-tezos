FROM ubuntu:18.04

# Install compilation dependencies
RUN apt-get update -y
RUN apt-get install -y rsync git m4 build-essential patch unzip bubblewrap wget pkg-config libgmp-dev libev-dev libhidapi-dev libsodium-dev libcurl4-gnutls-dev ocaml
RUN apt-get install -y libgmp-dev m4 perl

# Install Opam
RUN wget https://github.com/ocaml/opam/releases/download/2.0.3/opam-2.0.3-x86_64-linux
RUN cp opam-2.0.3-x86_64-linux /usr/local/bin/opam
RUN chmod a+x /usr/local/bin/opam

# Install Dune
# TODO: Pin version
RUN git clone https://github.com/ocaml/dune.git
WORKDIR /dune/
RUN make release
RUN make install

# Download tezos
# TODO: Pin version
WORKDIR /
RUN git clone https://gitlab.com/tezos/tezos.git

# Build alphanet node and client
WORKDIR /tezos/
RUN git checkout alphanet
RUN opam init --bare --disable-sandboxing
RUN eval $(opam env)
RUN make build-deps
RUN eval $(opam env)
RUN opam config exec make
RUN export PATH=/tezos:$PATH
# RUN source ./src/bin_client/bash-completion.sh
RUN export TEZOS_CLIENT_UNSAFE_DISABLE_DISCLAIMER=Y

# Copy start script
COPY ./start-tezos-sandbox.sh .

ENTRYPOINT ["./start-tezos-sandbox.sh"]
