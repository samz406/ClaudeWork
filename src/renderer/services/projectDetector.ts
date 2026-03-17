export type ProjectType = 'nodejs' | 'python' | 'rust' | 'go' | 'java' | 'dotnet' | 'ruby' | 'unknown';

export interface ProjectInfo {
  type: ProjectType;
  name: string;
  label: string;
  icon: string;
  configFile?: string;
}

const PROJECT_SIGNATURES: Array<{ file: string; type: ProjectType; label: string; icon: string }> = [
  { file: 'package.json', type: 'nodejs', label: 'Node.js', icon: '📦' },
  { file: 'pyproject.toml', type: 'python', label: 'Python', icon: '🐍' },
  { file: 'setup.py', type: 'python', label: 'Python', icon: '🐍' },
  { file: 'requirements.txt', type: 'python', label: 'Python', icon: '🐍' },
  { file: 'Cargo.toml', type: 'rust', label: 'Rust', icon: '🦀' },
  { file: 'go.mod', type: 'go', label: 'Go', icon: '🔵' },
  { file: 'pom.xml', type: 'java', label: 'Java', icon: '☕' },
  { file: 'build.gradle', type: 'java', label: 'Java/Gradle', icon: '☕' },
  { file: '*.csproj', type: 'dotnet', label: '.NET', icon: '🟣' },
  { file: 'Gemfile', type: 'ruby', label: 'Ruby', icon: '💎' },
];

class ProjectDetectorService {
  async detect(workingDirectory: string): Promise<ProjectInfo> {
    try {
      const result = await window.electron.fs.readDir(workingDirectory);
      if (!result.success || !result.entries) {
        return { type: 'unknown', name: this.extractName(workingDirectory), label: 'Project', icon: '📁' };
      }

      const fileNames = new Set(result.entries.map(e => e.name));
      const dirName = this.extractName(workingDirectory);

      for (const sig of PROJECT_SIGNATURES) {
        if (sig.file.startsWith('*')) {
          // Glob pattern like *.csproj
          const ext = sig.file.substring(1);
          const match = result.entries.find(e => e.name.endsWith(ext));
          if (match) {
            return { type: sig.type, name: dirName, label: sig.label, icon: sig.icon, configFile: match.name };
          }
        } else if (fileNames.has(sig.file)) {
          return { type: sig.type, name: dirName, label: sig.label, icon: sig.icon, configFile: sig.file };
        }
      }

      return { type: 'unknown', name: dirName, label: 'Project', icon: '📁' };
    } catch {
      return { type: 'unknown', name: this.extractName(workingDirectory), label: 'Project', icon: '📁' };
    }
  }

  private extractName(dirPath: string): string {
    return dirPath.split(/[/\\]/).filter(Boolean).pop() || 'Project';
  }
}

export const projectDetectorService = new ProjectDetectorService();
