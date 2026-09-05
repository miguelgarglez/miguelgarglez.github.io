import type { Project, ProjectLink } from "../data/projects";

export function getProjectDetailHref(project: Project): string {
  return project.caseStudyUrl ?? `/projects/${project.slug}`;
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function liveLinkLabel(href: string): string {
  if (href.includes("npmjs.com")) {
    return "npm package";
  }

  return "Live demo";
}

/** Consistent action links for list cards and project detail pages. */
export function getProjectActionLinks(project: Project): ProjectLink[] {
  const links: ProjectLink[] = [];
  const seen = new Set<string>();

  const add = (label: string, href: string) => {
    if (seen.has(href)) return;
    seen.add(href);
    links.push({
      label,
      href,
      external: isExternalHref(href),
    });
  };

  if (project.showcaseUrl) {
    add("Product showcase", project.showcaseUrl);
  }

  if (project.liveUrl) {
    add(liveLinkLabel(project.liveUrl), project.liveUrl);
  }

  if (project.repositoryUrl) {
    add("Source code", project.repositoryUrl);
  }

  return links;
}
