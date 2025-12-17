<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\FirebaseCrudService;

class SeedSkills extends Command
{
    protected $signature = 'skills:seed {--clear : Clear existing skills before seeding}';
    protected $description = 'Seed the skills collection in Firebase';

    protected $firebase;

    public function __construct(FirebaseCrudService $firebase)
    {
        parent::__construct();
        $this->firebase = $firebase;
    }

    public function handle()
    {
        if ($this->option('clear')) {
            $this->info('Clearing existing skills...');
            $existingSkills = $this->firebase->readAll('skills');
            foreach ($existingSkills as $skill) {
                $this->firebase->delete('skills', $skill['_id']);
            }
            $this->info('Cleared ' . count($existingSkills) . ' existing skills.');
        }

        $skillsData = [
            '💻 Core Technical Skills' => [
                'Computer Hardware & Troubleshooting',
                'Operating Systems (Windows, macOS, Linux)',
                'Networking Fundamentals',
                'System Administration',
                'IT Support / Helpdesk',
                'Cloud Computing (AWS, Azure, Google Cloud)',
                'Virtualization (VMware, Hyper-V)',
                'Cybersecurity Basics',
                'Database Management (SQL, MySQL, Oracle)',
                'Scripting (Bash, PowerShell)',
            ],
            
            '🧑‍💻 Programming & Development' => [
                'HTML / CSS / JavaScript',
                'Python',
                'Java',
                'C / C++ / C#',
                'PHP',
                'Go (Golang)',
                'Kotlin / Swift (Mobile Development)',
                'TypeScript',
                'API Integration',
                'Software Testing (Unit, Integration, Automation)',
            ],
            
            '☁️ Cloud & DevOps' => [
                'CI/CD Pipelines',
                'Docker / Kubernetes',
                'Infrastructure as Code (Terraform, Ansible)',
                'Git / Version Control',
                'Monitoring Tools (Prometheus, Grafana)',
                'Cloud Security',
                'Serverless Computing',
                'Load Balancing & Scaling',
            ],
            
            '🧠 Data & Analytics' => [
                'Data Analysis',
                'Data Visualization (Tableau, Power BI)',
                'Machine Learning / AI Basics',
                'Data Engineering',
                'Data Warehousing',
                'Statistics & Probability',
                'Big Data Tools (Hadoop, Spark)',
                'Database Query Optimization',
            ],
            
            '🔒 Cybersecurity' => [
                'Network Security',
                'Ethical Hacking / Penetration Testing',
                'Vulnerability Assessment',
                'Firewalls & VPNs',
                'Incident Response',
                'Security Auditing & Compliance',
                'Encryption & Cryptography',
                'Security Information and Event Management (SIEM)',
            ],
            
            '🎨 UI/UX & Design' => [
                'UI/UX Principles',
                'Wireframing & Prototyping (Figma, Adobe XD)',
                'Responsive Web Design',
                'Accessibility Standards',
                'Graphic Design (Photoshop, Illustrator)',
                'Design Systems & Component Libraries',
            ],
            
            '🧩 Project & Business IT Skills' => [
                'Agile / Scrum / Kanban',
                'IT Project Management',
                'Business Analysis',
                'Technical Documentation',
                'ITIL Framework',
                'Quality Assurance (QA)',
                'Product Management',
            ],
            
            '🤖 Emerging Tech' => [
                'Artificial Intelligence (AI)',
                'Internet of Things (IoT)',
                'Blockchain',
                'Augmented Reality (AR) / Virtual Reality (VR)',
                'Quantum Computing',
                'Edge Computing',
            ],
        ];

        $this->info('Starting to seed skills...');
        $this->newLine();

        $totalSkills = 0;
        $failed = 0;

        $progressBar = $this->output->createProgressBar(array_sum(array_map('count', $skillsData)));
        $progressBar->start();

        foreach ($skillsData as $category => $skills) {
            preg_match('/^(.*?)\s+(.+)$/', $category, $matches);
            $icon = $matches[1] ?? '';
            $categoryName = $matches[2] ?? $category;

            foreach ($skills as $skillName) {
                $skillData = [
                    'name' => $skillName,
                    'category' => $categoryName,
                    'icon' => $icon,
                    'description' => '',
                    'created_at' => now()->toIso8601String(),
                    'updated_at' => now()->toIso8601String(),
                ];

                try {
                    $this->firebase->create('skills', $skillData);
                    $totalSkills++;
                } catch (\Exception $e) {
                    $failed++;
                }

                $progressBar->advance();
                usleep(100000); // Small delay to avoid rate limiting
            }
        }

        $progressBar->finish();
        $this->newLine(2);

        $this->info("✅ Successfully seeded {$totalSkills} skills!");
        
        if ($failed > 0) {
            $this->warn("⚠️  Failed to add {$failed} skills.");
        }

        $this->newLine();
        $this->info('Summary by category:');
        foreach ($skillsData as $category => $skills) {
            $this->line("  • {$category}: " . count($skills) . " skills");
        }

        return Command::SUCCESS;
    }
}
