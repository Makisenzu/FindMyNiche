<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Services\FirebaseCrudService;

class QuestionsSeeder extends Seeder
{
    protected $firebase;

    public function __construct(FirebaseCrudService $firebase)
    {
        $this->firebase = $firebase;
    }

    public function run(): void
    {
        $questions = [
            1 => "I enjoy breaking down complex problems into logical steps",
            2 => "I prefer making decisions based on data and evidence rather than intuition",
            3 => "I enjoy thinking outside the box and exploring innovative solutions",
            4 => "I prefer projects that allow me to express my creative ideas and originality",
            5 => "I enjoy understanding user needs and creating solutions that help people",
            6 => "I prioritize making technology accessible and user-friendly for everyone",
            7 => "I enjoy exploring new technologies and learning how they work",
            8 => "I'm always asking 'why' and seeking deeper understanding of systems",
            9 => "I take ownership of projects and ensure they're completed thoroughly",
            10 => "I prefer reliable, well-tested solutions over quick experimental ones",
            11 => "I enjoy thinking about the long-term impact and future possibilities of technology",
            12 => "I prefer strategic planning and thinking about how to transform systems",
            13 => "",
            14 => "I prefer working in teams and collaborating with others on projects",
            15 => "I work best independently and prefer focusing deeply on my own tasks",
            16 => "I enjoy focusing on specific details and ensuring everything is perfect",
            17 => "I prefer seeing the big picture and understanding overall system architecture",
            18 => "I enjoy following established processes and best practices",
            19 => "I prefer focusing on delivering results quickly rather than following strict processes",
            20 => "I work best with clear structure, deadlines, and defined milestones",
            21 => "I prefer flexible schedules and adapting my approach as projects evolve",
            22 => "",
            23 => "I'm most interested in working with healthcare and medical technology",
            24 => "I'm most interested in working with financial technology and banking systems",
            25 => "I'm most interested in working with education and learning platforms",
            26 => "I'm most interested in working with logistics and supply chain technology",
            27 => "I'm most interested in working with e-commerce and retail technology",
            28 => "I'm most interested in working across multiple industries",
            29 => "I'm passionate about solving cybersecurity and data protection challenges",
            30 => "I enjoy optimizing systems for better performance and efficiency",
            31 => "I focus on creating intuitive and delightful user experiences",
            32 => "I love automating repetitive processes to save time and resources",
            33 => "I work on data analysis and helping organizations make data-driven decisions",
            34 => "I focus on building scalable systems that grow with businesses",
            35 => "I want to help development teams work more efficiently",
            36 => "I want to create solutions that directly benefit end-users",
            37 => "I want to help businesses solve strategic technology challenges",
            38 => "I want to work with specific industries to solve domain-specific problems",
            39 => "",
            40 => "Do you enjoy editing videos or creating multimedia content?",
            41 => "Are you interested in graphic design or digital art creation?",
            42 => "Do you enjoy coding or programming?",
            43 => "Are you interested in building websites or mobile applications?",
            44 => "Do you find data visualization and reporting interesting?",
            45 => "Are you curious about machine learning or artificial intelligence?",
            46 => "Do you enjoy game development or interactive media design?",
            47 => "Are you interested in virtual reality or augmented reality technologies?",
            48 => "Are you interested in cybersecurity and ethical hacking?",
            49 => "Do you enjoy protecting systems and preventing security threats?",
            50 => "Are you interested in cloud computing and infrastructure management?",
            51 => "Do you enjoy automating processes and workflow optimization?",
        ];

        $this->command->info('Starting to seed questions...');
        $totalQuestions = 0;

        foreach ($questions as $id => $questionText) {
            if (empty($questionText)) {
                $this->command->line("  ⊘ Skipping empty question {$id}");
                continue;
            }

            $questionData = [
                'id' => $id,
                'question' => $questionText,
                'created_at' => now()->toIso8601String(),
                'updated_at' => now()->toIso8601String(),
            ];

            try {
                $this->firebase->create('questions', $questionData);
                $totalQuestions++;
                $this->command->line("  ✓ Added question {$id}");
            } catch (\Exception $e) {
                $this->command->error("  ✗ Failed to add question {$id} - " . $e->getMessage());
            }
        }

        $this->command->info("Successfully seeded {$totalQuestions} questions!");
    }
}
