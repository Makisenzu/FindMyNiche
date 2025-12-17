<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Services\FirebaseCrudService;

class SkillsSeeder extends Seeder
{
    protected $firebase;

    public function __construct(FirebaseCrudService $firebase)
    {
        $this->firebase = $firebase;
    }

    public function run(): void
    {
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

        $this->command->info('Starting to seed skills...');
        $totalSkills = 0;

        foreach ($skillsData as $category => $skills) {
            // Extract emoji and category name
            preg_match('/^(.*?)\s+(.+)$/', $category, $matches);
            $icon = $matches[1] ?? '';
            $categoryName = $matches[2] ?? $category;

            $this->command->info("Seeding category: {$categoryName}");

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
                    $this->command->line("  ✓ Added: {$skillName}");
                } catch (\Exception $e) {
                    $this->command->error("  ✗ Failed to add: {$skillName} - " . $e->getMessage());
                }
            }
        }

        $this->command->info("Successfully seeded {$totalSkills} skills!");
    }
}
