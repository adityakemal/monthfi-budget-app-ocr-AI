FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV DOCKER=1
ENV PORT=5000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create data directory and set permissions
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

# Remove public copy since the directory doesn't exist
COPY --chown=nextjs:nodejs .next/standalone ./
COPY --chown=nextjs:nodejs .next/static ./.next/static
# Install build tools and reinstall the database library so it gets the Linux binaries!
RUN apk add --no-cache python3 make g++ curl bash \
    && curl -fsSL https://bun.sh/install | bash \
    && export PATH="/root/.bun/bin:$PATH" \
    && /root/.bun/bin/bun add @libsql/client

USER nextjs

EXPOSE 5000

CMD ["node", "server.js"]