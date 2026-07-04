# WmsCashierFrontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.1.5.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Deployment

`wms-cashier-frontend` is deployed by GitOps and served at `https://wms.flyingjack.top`.

### Repository And Branches

- Repository: `git@github.com:flyingjack-cloud/wms-cashier-frontend.git`
- Development branch: `develop`
- Production branch: `main`
- `main` accepts changes only through pull requests.
- Pull requests targeting `main` run the frontend build check only.
- Pushes to `develop` or merged changes on `main` build and push the Docker image, then update the GitOps image patch.

### Resources

- Kustomize overlay: `frontend/wms-cashier-frontend/overlays/prod`
- Namespace: `flyingjack-prod`
- Deployment: `wms-cashier-frontend-v1`
- Service: `wms-cashier-frontend`
- Gateway: `wms-cashier-frontend-gateway`
- VirtualService: `wms-cashier-frontend-routes`
- TLS secret: `wms-flyingjack-top-tls`
- Image: `100.107.74.15:5000/wms-cashier-frontend:<tag>`

### Prerequisites

1. DNS `wms.flyingjack.top` points to the public IP of the cluster Istio ingress.
2. Istio ingress gateway is installed and matches selector `istio: ingressgateway`.
3. cert-manager is installed.
4. `ClusterIssuer/letsencrypt-prod` exists.
5. Namespace `flyingjack-prod` exists.
6. ArgoCD can read the `k8s-gitops` repository.
7. Cluster nodes can pull images from `100.107.74.15:5000`.
8. CI secrets are configured: `REGISTRY_URL`, `GITEE_TOKEN`, and, if registry auth is required, `REGISTRY_USERNAME` and `REGISTRY_PASSWORD`.

### 1. Create Namespace

Skip this if the namespace already exists:

```bash
kubectl create namespace flyingjack-prod
```

### 2. Check DNS

Before requesting TLS, confirm the domain resolves to the ingress address:

```bash
dig +short wms.flyingjack.top
kubectl get svc -n istio-system
```

`wms.flyingjack.top` must be publicly reachable by Let's Encrypt for HTTP-01 validation.

### 3. Create TLS Certificate

The Gateway expects secret `wms-flyingjack-top-tls` in namespace `flyingjack-prod`. Create the Certificate once before enabling the ArgoCD application:

```bash
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: wms-flyingjack-top-tls
  namespace: istio-system
spec:
  secretName: wms-flyingjack-top-tls
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
    - wms.flyingjack.top
EOF
```

Wait until the certificate is ready:

```bash
kubectl get certificate wms-flyingjack-top-tls -n flyingjack-prod -w
```

Confirm the secret was created:

```bash
kubectl get secret wms-flyingjack-top-tls -n flyingjack-prod
```

If issuance is stuck, inspect cert-manager resources:

```bash
kubectl describe certificate wms-flyingjack-top-tls -n flyingjack-prod
kubectl get order,challenge -n flyingjack-prod
kubectl describe challenge -n flyingjack-prod
```

Common causes are DNS not pointing to the ingress IP, port 80 not being publicly reachable, a missing or unhealthy `ClusterIssuer/letsencrypt-prod`, or routing that blocks ACME HTTP-01 challenges.

### 4. Check Kustomize Rendering

Run this from the `k8s-gitops` repository before committing:

```bash
kubectl kustomize frontend/wms-cashier-frontend/overlays/prod
```

### 5. Create ArgoCD Application

Create the production ArgoCD application:

```bash
kubectl apply -f - <<EOF
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: wms-cashier-frontend-prod
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/flyingjack-cloud/k8s-gitops
    targetRevision: main
    path: frontend/wms-cashier-frontend/overlays/prod
  destination:
    server: https://kubernetes.default.svc
    namespace: flyingjack-prod
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
EOF
```

Check sync status:

```bash
argocd app get wms-cashier-frontend-prod
argocd app sync wms-cashier-frontend-prod
```

Without the ArgoCD CLI:

```bash
kubectl get application wms-cashier-frontend-prod -n argocd
```

### 6. Verify Deployment

Check rollout, networking resources, and HTTPS:

```bash
kubectl rollout status deployment/wms-cashier-frontend-v1 -n flyingjack-prod
kubectl get pod -n flyingjack-prod -l app=wms-cashier-frontend
kubectl get svc wms-cashier-frontend -n flyingjack-prod
kubectl get gateway wms-cashier-frontend-gateway -n flyingjack-prod
kubectl get virtualservice wms-cashier-frontend-routes -n flyingjack-prod
kubectl get destinationrule wms-cashier-frontend-rule -n flyingjack-prod
curl -I https://wms.flyingjack.top
```

### 7. CI Image Updates

GitHub Actions builds and pushes:

```text
${REGISTRY_URL}/wms-cashier-frontend:prod-${SHORT_SHA}
```

Then it updates the GitOps image patch:

```text
frontend/wms-cashier-frontend/overlays/prod/wms-cashier-frontend-patch.yaml
```

ArgoCD applies the new image tag after the GitOps repository receives that commit.

### 8. Rollback

To roll back, change the image tag in `frontend/wms-cashier-frontend/overlays/prod/wms-cashier-frontend-patch.yaml` to the previous working version, commit it to the GitOps repository, and wait for ArgoCD to sync.

Do not edit the live Deployment directly; ArgoCD will overwrite it.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
