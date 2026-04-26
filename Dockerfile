FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# copy hasil build saja
COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public

USER nextjs

EXPOSE 5000

CMD ["node", "server.js"]