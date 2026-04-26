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

USER nextjs

EXPOSE 5000

CMD ["node", "server.js"]